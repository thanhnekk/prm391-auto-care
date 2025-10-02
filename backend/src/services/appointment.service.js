// services/appointment.service.js
const Appointment = require("../models/appointment.model.js");
const Doctor = require("../models/doctor.model.js");
const ServiceType = require("../models/servicetype.model.js");
const BaseError = require("../utils/BaseError.js");
const { StatusCodes } = require("http-status-codes");

// Thời gian tối thiểu trước khi đặt lịch (2 ngày)
const MIN_SCHEDULE_DIFF_MS = 2 * 24 * 60 * 60 * 1000; // 2 ngày
// Thời gian tối đa để thanh toán (12h)
const PAYMENT_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 giờ

// Tạo appointment
const createAppointment = async ({ userId, doctorId, serviceTypeIds, scheduledAt, paymentMethod }) => {
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) throw new BaseError(StatusCodes.NOT_FOUND, "Bác sĩ không tồn tại");

        const scheduleDate = new Date(scheduledAt);
        const now = new Date();
        if (scheduleDate - now < MIN_SCHEDULE_DIFF_MS) {
            throw new BaseError(StatusCodes.BAD_REQUEST, "Phải đặt lịch ít nhất 2 ngày trước");
        }

        const services = await ServiceType.find({ _id: { $in: serviceTypeIds } });
        const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

        const appointment = new Appointment({
            userId,
            doctorId,
            serviceTypeIds,
            scheduledAt: scheduleDate,
            totalPrice,
            status: "pending",
            paid: false,
            paymentMethod,
        });

        await appointment.save();
        return appointment;
    } catch (error) {
        throw new BaseError(
            error.status || StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi tạo appointment: ${error.message}`
        );
    }
};

// Hàm cron job: hủy appointment quá 12h mà chưa thanh toán
const cancelPendingAppointments = async () => {
    try {
        const cutoff = new Date(Date.now() - PAYMENT_WINDOW_MS);
        const pendingAppointments = await Appointment.find({
            status: "pending",
            paid: false,
            createdAt: { $lt: cutoff }
        });

        for (const appt of pendingAppointments) {
            appt.status = "cancel";
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

    appt.status = "cancel";
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
const getAppointmentsByUser = async (userId) => {
    return await Appointment.find({ userId }).populate("doctorId serviceTypeIds");
};

// Lấy appointment theo bác sĩ
const getAppointmentsByDoctor = async (doctorId) => {
    return await Appointment.find({ doctorId }).populate("userId serviceTypeIds");
};

module.exports = {
    createAppointment,
    payAppointment,
    cancelAppointment,
    completeAppointment,
    getAppointmentsByUser,
    getAppointmentsByDoctor,
    cancelPendingAppointments, // <- cron job
};
