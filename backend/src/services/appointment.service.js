const Appointment = require("../models/appointment.model.js");
const Doctor = require("../models/doctor.model.js");
const ServiceType = require("../models/servicetype.model.js");
const { DateTime } = require("luxon");
const User = require("../models/user.model.js"); 
const BaseError = require("../utils/BaseError.js");
const { StatusCodes } = require("http-status-codes");
const { generateVnPayUrl } = require("../utils/generateVNPAYUrl.js");

const MIN_SCHEDULE_DIFF_MS = 2 * 24 * 60 * 60 * 1000; // 2 ngày
const MIN_SCHEDULE_DIFF_MS_VNPAY = 1 * 24 * 60 * 60 * 1000; // 1 ngày
const MAX_SCHEDULE_DIFF_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày
const PAYMENT_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 giờ
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 17;

// Kiểm tra slot trống (1h/slot)
const isSlotAvailable = async (doctorId, scheduledAt) => {
    const startHour = scheduledAt.getHours();
    if (startHour < WORK_START_HOUR || startHour >= WORK_END_HOUR) return false;
    const slotStart = new Date(scheduledAt);
    slotStart.setMinutes(0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
    console.log("slot" + slotStart + "-" + slotEnd)
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

        if (paymentMethod === "Cash" && scheduleDate - now < MIN_SCHEDULE_DIFF_MS) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Người dùng thanh toán tiền mặt phải đặt lịch ít nhất 2 ngày");
        }
        if (paymentMethod === "VNPay" && scheduleDate - now < MIN_SCHEDULE_DIFF_MS_VNPAY) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Người dùng thanh toán VNPay phải đặt lịch ít nhất 1 ngày");
        }
        if (scheduleDate - now > MAX_SCHEDULE_DIFF_MS) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Chỉ được đặt lịch trước tối đa 30 ngày");
        }

        console.log("Checking slot for doctor:", doctorId, "at", scheduleDate.toISOString());
        const available = await isSlotAvailable(doctorId, scheduleDate);
        if (!available) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Slot đã được đặt hoặc không hợp lệ, vui lòng chọn giờ khác");
        }

        const service = await ServiceType.findById(serviceTypeId);
        if (!service) throw new BaseError(StatusCodes.NOT_FOUND, "Dịch vụ không tồn tại");

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
            const paymentUrl = generateVnPayUrl(appointment);
            return {
                _id: appointment._id,
                appointment,
                paymentUrl
            };
        } else {
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

    const now = new Date();
    const scheduleDate = new Date(appt.scheduledAt);
    const timeDiff = scheduleDate - now; 
    const HOURS_24_MS = 24 * 60 * 60 * 1000;
    const HOURS_6_MS = 6 * 60 * 60 * 1000;


    if (appt.paymentMethod === "VNPay") {
        if (timeDiff < HOURS_6_MS) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Người dùng thanh toán với VNPay chỉ được hủy lịch hẹn trước 6 giờ");
        }
        if (appt.status !== "pending") {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Chỉ được hủy VNPay khi trạng thái là pending");
        }
    } else if (appt.paymentMethod === "Cash") {
        if (timeDiff < HOURS_24_MS) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Người dùng thanh toán tiền mặt chỉ được hủy lịch hẹn trước 24 giờ");
        }
        if (!["pending", "confirmed"].includes(appt.status)) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Chỉ được hủy Cash khi trạng thái là pending hoặc confirmed");
        }
    } else {
        throw new BaseError(StatusCodes.BAD_REQUEST, "Phương thức thanh toán không hợp lệ");
    }

    appt.status = "canceled";
    await appt.save();
    return appt;
};

const retryPayment = async (appointmentId) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new BaseError(StatusCodes.NOT_FOUND, "Appointment không tồn tại");
    if (appt.paid) throw new BaseError(StatusCodes.BAD_REQUEST, "Appointment đã thanh toán");
    if (appt.status !== "pending")
        throw new BaseError(StatusCodes.BAD_REQUEST, "Không thể thanh toán cho appointment này");

    // Cập nhật txnRef mới
    const newTxnRef = `${appt._id}_${Date.now()}`;
    appt.txnRef = newTxnRef;
    await appt.save();

    // Tạo URL thanh toán mới
    const paymentUrl = generateVnPayUrl(appt);
    return { paymentUrl };
};

// Hoàn tất khám
const completeAppointment = async (appointmentId) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new BaseError(StatusCodes.NOT_FOUND, "Appointment không tồn tại");
    if (appt.status !== "confirmed") throw new BaseError(StatusCodes.BAD_REQUEST, "Chỉ complete khi confirmed");

  const now = DateTime.now().setZone("Asia/Ho_Chi_Minh");

  const scheduledAtVN = DateTime.fromJSDate(appt.scheduledAt).setZone("Asia/Ho_Chi_Minh");

  // ⚠️ Nếu còn hơn 1 tiếng nữa mới đến giờ hẹn thì không được complete
  if (scheduledAtVN.diff(now, "hours").hours > -1) {
    // Tức là hiện tại vẫn chưa trễ hơn scheduledAt 1 giờ
    throw new BaseError(StatusCodes.BAD_REQUEST, "Chưa đến giờ hoàn thành lịch hẹn");
  }
    appt.status = "done";
    appt.paid = true;
    await appt.save();
    return appt;
};

// Lấy appointment theo bác sĩ
const getAppointmentsByDoctor = async (userId) => {
    const doctorProfile = await Doctor.findOne({ userId: userId });
    if (!doctorProfile) {
      throw new BaseError(StatusCodes.NOT_FOUND, "Không tìm thấy hồ sơ bác sĩ.");
    }
    const doctorId = doctorProfile._id;
    return await Appointment.find({ doctorId }).populate("userId serviceTypeIds");
};

// Lấy slots
const getDoctorSlots = async (doctorId, dateStr) => {
    const date = new Date(dateStr + "T00:00:00Z"); // Luôn dùng UTC
    const slots = [];
    for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
        const startTime = new Date(date);
        startTime.setUTCHours(hour, 0, 0, 0); // Dùng UTC
        
        const endTime = new Date(date);
        endTime.setUTCHours(hour + 1, 0, 0, 0); // Dùng UTC

        const conflict = await Appointment.findOne({
            doctorId,
            scheduledAt: startTime,
            status: { $in: ["pending", "confirmed"] }
        });

        slots.push({
            startTime: startTime.toISOString(), // Trả về ISO string (UTC)
            endTime: endTime.toISOString(),
            available: !conflict
        });
    }
    return slots;
};

// Helper
const _formatAppointmentForFE = (appt) => {
    if (!appt) return null;

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

// Lấy appointment theo user 
const getAppointmentsByUser = async (userId) => {
    try {
        const appointments = await Appointment.find({ userId })
            .populate({
                path: "doctorId",
                populate: [
                    { path: "userId", model: "User", select: "_id username email phone" },
                    { path: "serviceTypeIds", model: "ServiceType", select: "_id name price" }
                ]
            })
            .populate("serviceTypeIds", "_id name price")
            .populate("userId", "_id username email phone")
            .sort({ scheduledAt: -1 });

        if (!appointments || appointments.length === 0) {
            return [];
        }

        // Chỉ cần map qua hàm helper
        return appointments.map(_formatAppointmentForFE);

    } catch (error) {
        console.error("Lỗi trong getAppointmentsByUser:", error);
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi lấy danh sách appointment: ${error.message}`
        );
    }
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

    // Gọi hàm helper
    return _formatAppointmentForFE(appt);
};

// Lấy appointment theo id, kiểm tra user 
const getAppointmentByIdWithAuth = async (appointmentId, userId) => {
    const appt = await getAppointmentById(appointmentId);
    if (appt.userId?._id.toString() !== userId) {
        throw new BaseError(StatusCodes.FORBIDDEN, "Bạn không có quyền xem appointment này");
    }

    return appt;
};

// Admin

// Lấy tất cả lịch hẹn (cho Admin, có phân trang, lọc)
const adminGetAllAppointments = async (query) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filters = {};

        if (query.status) filters.status = query.status;
        if (query.paid) filters.paid = query.paid === 'true';
        if (query.paymentMethod) filters.paymentMethod = query.paymentMethod;
        if (query.doctorId) filters.doctorId = query.doctorId;
        if (query.userId) filters.userId = query.userId;

        // Lọc theo ngày (ví dụ: ?date=2025-11-09)
        if (query.date) {
            const start = new Date(query.date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(query.date);
            end.setHours(23, 59, 59, 999);
            filters.scheduledAt = { $gte: start, $lte: end };
        }

        const appointments = await Appointment.find(filters)
            // Populate thông tin cơ bản cho Admin list view
            .populate("userId", "username email")
            .populate({
                path: "doctorId",
                select: "userId specialization", 
                populate: { path: "userId", model: "User", select: "username" }
            })
            .populate("serviceTypeIds", "name price")
            .sort({ scheduledAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalAppointments = await Appointment.countDocuments(filters);

        return {
            appointments, 
            currentPage: page,
            totalPages: Math.ceil(totalAppointments / limit),
            totalAppointments,
        };
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi lấy lịch hẹn (Admin): ${error.message}`
        );
    }
};

// Admin cập nhật lịch hẹn 
const adminUpdateAppointment = async (appointmentId, updateData) => {
    try {
        const {
            status,
            paid,
            paymentMethod,
            scheduledAt,
            doctorId,
            totalPrice
        } = updateData;

        const dataToUpdate = {};
        if (status) dataToUpdate.status = status;
        if (paid !== undefined) dataToUpdate.paid = paid;
        if (paymentMethod) dataToUpdate.paymentMethod = paymentMethod;
        if (scheduledAt) dataToUpdate.scheduledAt = scheduledAt;
        if (doctorId) dataToUpdate.doctorId = doctorId;
        if (totalPrice) dataToUpdate.totalPrice = totalPrice;

        const updatedAppt = await Appointment.findByIdAndUpdate(
            appointmentId,
            dataToUpdate,
            { new: true }
        );

        if (!updatedAppt) {
            throw new BaseError(StatusCodes.NOT_FOUND, "Không tìm thấy lịch hẹn");
        }

        return updatedAppt;
    } catch (error) {
        if (error instanceof BaseError) throw error;
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi cập nhật lịch hẹn (Admin): ${error.message}`
        );
    }
};

module.exports = {
    createAppointment,
    payAppointment,
    cancelAppointment,
    completeAppointment,
    getAppointmentsByDoctor,
    cancelPendingAppointments,
    getDoctorSlots,
    retryPayment,
    getAppointmentsByUser,
    getAppointmentById,
    getAppointmentByIdWithAuth,
    // --- Các hàm mới cho Admin ---
    adminGetAllAppointments,
    adminUpdateAppointment,
};