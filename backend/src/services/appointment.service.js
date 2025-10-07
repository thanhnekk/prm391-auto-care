// services/appointment.service.js
const Appointment = require("../models/appointment.model.js");
const Doctor = require("../models/doctor.model.js");
const ServiceType = require("../models/servicetype.model.js");
const BaseError = require("../utils/BaseError.js");
const { StatusCodes } = require("http-status-codes");
const { generateVnPayUrl } = require("../utils/generateVNPAYUrl.js");
// Thời gian tối thiểu trước khi đặt lịch (2 ngày)
const MIN_SCHEDULE_DIFF_MS = 2 * 24 * 60 * 60 * 1000; // 2 ngày
// Thời gian tối đa để thanh toán (12h)
const PAYMENT_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 giờ
// Giờ làm việc chung
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 17;

// Kiểm tra slot trống (1h/slot)
const isSlotAvailable = async (doctorId, scheduledAt) => {
    const startHour = scheduledAt.getHours();
    // Kiểm tra giờ làm việc
    if (startHour < WORK_START_HOUR || startHour >= WORK_END_HOUR) return false;
    // Xác định start và end của slot
    const slotStart = new Date(scheduledAt);
    slotStart.setMinutes(0, 0, 0); // reset phút, giây, mili giây
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // slot 1h
    console.log("slot" + slotStart + "-" + slotEnd)
    // Tìm appointment trùng trong khung giờ
    const conflict = await Appointment.findOne({
        doctorId,
        scheduledAt: { $gte: slotStart, $lt: slotEnd },
        status: { $in: ["pending", "confirmed"] }
    });
    return !conflict;
};



// Tạo appointment
const createAppointment = async ({ userId, doctorId, serviceTypeId, scheduledAt, paymentMethod }) => {
    try {
        if (!paymentMethod) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Payment method is required");
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) throw new BaseError(StatusCodes.NOT_FOUND, "Bác sĩ không tồn tại");

        const scheduleDate = new Date(scheduledAt);
        const now = new Date();
        if (scheduleDate - now < MIN_SCHEDULE_DIFF_MS) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Phải đặt lịch ít nhất 2 ngày trước");
        }

        // Kiểm tra slot trống
        console.log("Checking slot for doctor:", doctorId, "at", scheduleDate.toISOString());
        const available = await isSlotAvailable(doctorId, scheduleDate);
        if (!available) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Slot đã được đặt hoặc không hợp lệ, vui lòng chọn giờ khác");
        }

        const service = await ServiceType.findById(serviceTypeId);
        if (!service) throw new BaseError(StatusCodes.NOT_FOUND, "Dịch vụ không tồn tại");

        // Tạo appointment
        const appointment = new Appointment({
            userId,
            doctorId,
            serviceTypeIds: serviceTypeId,
            scheduledAt: scheduleDate,
            totalPrice: service.price,
            status: paymentMethod === "Cash" ? "confirmed" : "pending",
            paid: false,
            paymentMethod,
        });

        await appointment.save();
        if (paymentMethod === "VNPay") {
            // Gọi hàm tạo URL thanh toán VNPay
            const paymentUrl = generateVnPayUrl(appointment);
            console.log(paymentUrl)
            return {
                _id: appointment._id,
                appointment,   
                paymentUrl               // URL VNPAY cho FE mở
            };
        } else {
            // Cash trả về appointment như bình thường
            return appointment;
        }

    } catch (error) {
        throw new BaseError(
            error.status || StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi tạo appointment: ${error.message}`
        );
    }
};

// Cron job hủy appointment quá 12h mà chưa thanh toán
const cancelPendingAppointments = async () => {
    try {
        const cutoff = new Date(Date.now() - PAYMENT_WINDOW_MS);
        const pendingAppointments = await Appointment.find({
            status: "pending",
            paid: false,
            createdAt: { $lt: cutoff }
        });

        for (const appt of pendingAppointments) {
            appt.status = "canceled";
            await appt.save();
            console.log(`Appointment ${appt._id} auto-canceled by cron job.`);
        }

        return pendingAppointments.length;
    } catch (error) {
        console.error("Error in cancelPendingAppointments cron:", error);
        return 0;
    }
};

// Thanh toán appointment
const payAppointment = async (appointmentId) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new BaseError(StatusCodes.NOT_FOUND, "Appointment không tồn tại");
    if (appt.status !== "pending") throw new BaseError(StatusCodes.BAD_REQUEST, "Chỉ thanh toán khi pending");

    appt.paid = true;
    appt.status = "confirmed";
    await appt.save();
    return appt;
};

// Hủy appointment (manual)
const cancelAppointment = async (appointmentId) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new BaseError(StatusCodes.NOT_FOUND, "Appointment không tồn tại");
    if (appt.status !== "pending") throw new BaseError(StatusCodes.BAD_REQUEST, "Chỉ hủy được khi pending");

    appt.status = "canceled";
    await appt.save();
    return appt;
};

// Hoàn tất khám
const completeAppointment = async (appointmentId) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new BaseError(StatusCodes.NOT_FOUND, "Appointment không tồn tại");
    if (appt.status !== "confirmed") throw new BaseError(StatusCodes.BAD_REQUEST, "Chỉ complete khi confirmed");

    appt.status = "done";
    await appt.save();
    return appt;
};

// Lấy appointment theo user
// Lấy appointment theo user (đồng nhất format với createAppointment)
const getAppointmentsByUser = async (userId) => {
    try {
        const appointments = await Appointment.find({ userId })
            .populate({
                path: "doctorId",
                populate: { path: "userId", model: "User" }, // lấy thông tin user của bác sĩ
            })
            .populate("serviceTypeIds")
            .populate("userId", "_id username email phone"); // để lấy thông tin user đặt lịch

        if (!appointments || appointments.length === 0) {
            return [];
        }

        // Map từng appointment về đúng format FE Android cần
        const formatted = appointments.map((appt) => ({
            _id: appt._id,
            userId: appt.userId
                ? {
                    _id: appt.userId._id,
                    name: appt.userId.username,
                    email: appt.userId.email,
                    phone: appt.userId.phone,
                }
                : null,
            doctorId: appt.doctorId
                ? {
                    _id: appt.doctorId._id,
                    specialization: appt.doctorId.specialization,
                    image: appt.doctorId.image,
                    name: appt.doctorId.userId?.username || null,
                    email: appt.doctorId.userId?.email || null,
                    phone: appt.doctorId.userId?.phone || null,
                }
                : null,
            serviceTypeIds: appt.serviceTypeIds
                ? {
                    _id: appt.serviceTypeIds._id,
                    name: appt.serviceTypeIds.name,
                    price: appt.serviceTypeIds.price,
                }
                : null,
            scheduledAt: appt.scheduledAt ? appt.scheduledAt.toISOString() : null,
            totalPrice: appt.totalPrice ?? 0,
            paid: appt.paid ?? false,
            paymentMethod: appt.paymentMethod || "Unknown",
            status: appt.status || "pending",
            createdAt: appt.createdAt,
            updatedAt: appt.updatedAt,
        }));

        return formatted;
    } catch (error) {
        console.error("❌ Lỗi trong getAppointmentsByUser:", error);
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi lấy danh sách appointment: ${error.message}`
        );
    }
};




// Lấy appointment theo bác sĩ
const getAppointmentsByDoctor = async (doctorId) => {
    return await Appointment.find({ doctorId }).populate("userId serviceTypeIds");
};

const getDoctorSlots = async (doctorId, dateStr) => {
    const date = new Date(dateStr + "T00:00:00"); // start of day
    const slots = [];
    for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(hour + 1, 0, 0, 0);

        const conflict = await Appointment.findOne({
            doctorId,
            scheduledAt: startTime,
            status: { $in: ["pending", "confirmed"] }
        });

        slots.push({
            startTime: startTime.toTimeString().slice(0, 5), // "HH:mm"
            endTime: endTime.toTimeString().slice(0, 5),
            available: !conflict
        });
    }
    return slots;
};

// Lấy appointment theo id, không kiểm tra quyền
const getAppointmentById = async (appointmentId) => {
    const appt = await Appointment.findById(appointmentId)
        .populate("userId", "_id username email phone") // user đặt lịch
        .populate({
            path: "doctorId",
            populate: [
                { path: "userId", model: "User", select: "_id username email phone" }, // user của bác sĩ
                { path: "serviceTypeIds", model: "ServiceType", select: "_id name price" } // service của bác sĩ
            ]
        })
        .populate("serviceTypeIds", "_id name price"); // service của appointment

    if (!appt) throw new BaseError(StatusCodes.NOT_FOUND, "Appointment không tồn tại");

    // Map ra format FE Android
    return {
        _id: appt._id,
        userId: appt.userId
            ? {
                _id: appt.userId._id,
                name: appt.userId.username,
                email: appt.userId.email,
                phone: appt.userId.phone,
            }
            : null,
        doctorId: appt.doctorId
            ? {
                _id: appt.doctorId._id,
                specialization: appt.doctorId.specialization,
                experience: appt.doctorId.experience,
                image: appt.doctorId.image,
                userId: appt.doctorId.userId
                    ? {
                        _id: appt.doctorId.userId._id,
                        name: appt.doctorId.userId.username,
                        email: appt.doctorId.userId.email,
                        phone: appt.doctorId.userId.phone,
                    }
                    : null,
                serviceTypeIds: appt.doctorId.serviceTypeIds
                    ? appt.doctorId.serviceTypeIds.map(st => ({
                        _id: st._id,
                        name: st.name,
                        price: st.price
                    }))
                    : [],
            }
            : null,
        serviceTypeIds: appt.serviceTypeIds
            ? {
                _id: appt.serviceTypeIds._id,
                name: appt.serviceTypeIds.name,
                price: appt.serviceTypeIds.price,
            }
            : null,
        scheduledAt: appt.scheduledAt ? appt.scheduledAt.toISOString() : null,
        totalPrice: appt.totalPrice ?? 0,
        paid: appt.paid ?? false,
        paymentMethod: appt.paymentMethod || "Unknown",
        status: appt.status || "pending",
        createdAt: appt.createdAt,
        updatedAt: appt.updatedAt,
    };
};

// Lấy appointment theo id, kiểm tra user có phải owner hay không
const getAppointmentByIdWithAuth = async (appointmentId, userId) => {
    const appt = await getAppointmentById(appointmentId); // tái sử dụng hàm đã chuẩn hóa

    if (appt.userId?._id.toString() !== userId) {
        throw new BaseError(StatusCodes.FORBIDDEN, "Bạn không có quyền xem appointment này");
    }

    return appt;
};



module.exports = {
    createAppointment,
    payAppointment,
    cancelAppointment,
    completeAppointment,
    getAppointmentsByUser,
    getAppointmentsByDoctor,
    cancelPendingAppointments, // <- cron job
    getDoctorSlots,
    getAppointmentById,
    getAppointmentByIdWithAuth
};
