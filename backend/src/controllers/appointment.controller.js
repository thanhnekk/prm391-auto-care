// controllers/appointment.controller.js
const AppointmentService = require("../services/appointment.service");

const createAppointment = async (req, res, next) => {
    try {
        const appt = await AppointmentService.createAppointment({ ...req.body, userId: req.user.id });
        const clientIp = req.ip;
  console.log("Client IP:", clientIp);
        res.status(201).json(appt);
    } catch (err) { next(err); }
};

const payAppointment = async (req, res, next) => {
    try {
        const appt = await AppointmentService.payAppointment(req.params.id);
        res.status(200).json(appt);
    } catch (err) { next(err); }
};

const repayAppointment = async (req, res, next) => {
    try {
        const appt = await AppointmentService.retryPayment(req.params.id);
        res.status(200).json(appt);
    } catch (err) { next(err); }
};

const cancelAppointment = async (req, res, next) => {
    try {
        const appt = await AppointmentService.cancelAppointment(req.params.id);
        res.status(200).json(appt);
    } catch (err) { next(err); }
};

const completeAppointment = async (req, res, next) => {
    try {
        const appt = await AppointmentService.completeAppointment(req.params.id);
        res.status(200).json(appt);
    } catch (err) { next(err); }
};

const getAppointmentsByUser = async (req, res, next) => {
    try {
        const appts = await AppointmentService.getAppointmentsByUser(req.user.id);
        res.status(200).json(appts);
    } catch (err) { next(err); }
};

const getDoctorSlots = async (req, res, next) => {
    try {
        const doctorId = req.params.doctorId;
        const dateStr = req.query.date; // yyyy-mm-dd
        if (!dateStr) return res.status(400).json({ message: "Thiếu query param 'date'" });

        const slots = await AppointmentService.getDoctorSlots(doctorId, dateStr);
        res.status(200).json(slots);
    } catch (err) {
        next(err);
    }
};

const getAppointmentById = async (req, res, next) => {
    try {
        const appt = await AppointmentService.getAppointmentById(req.params.id);
        res.status(200).json(appt);
    } catch (err) {
        next(err);
    }
};

const getAppointmentByIdWithAuth = async (req, res, next) => {
    try {
        const appt = await AppointmentService.getAppointmentByIdWithAuth(req.params.id, req.user.id);
        res.status(200).json(appt);
    } catch (err) {
        next(err);
    }
};

// Admin
const adminGetAllAppointments = async (req, res, next) => {
  try {
    const result = await AppointmentService.adminGetAllAppointments(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const adminUpdateAppointment = async (req, res, next) => {
  try {
    const updatedAppt = await AppointmentService.adminUpdateAppointment(
      req.params.id,
      req.body
    );
    res.status(200).json({ message: "Cập nhật lịch hẹn thành công (Admin)", appointment: updatedAppt });
  } catch (err) {
    next(err);
  }
};
const getMyAppointmentsDoctor = async (req, res, next) => {
  try {
    // 1. Lấy userId từ token (đây là ID của user bác sĩ)
    const userId = req.user.id; 
    const appts = await AppointmentService.getAppointmentsByDoctor(userId);
    res.status(200).json(appts);
    
  } catch (err) { 
    next(err); 
  }
};

module.exports = {
  createAppointment,
  payAppointment,
  cancelAppointment,
  completeAppointment,
  getAppointmentsByUser,
  getDoctorSlots,
  getAppointmentById,
  getAppointmentByIdWithAuth,
  repayAppointment,
  // --- Các hàm mới cho Admin ---
  adminGetAllAppointments,
  adminUpdateAppointment,
  getMyAppointmentsDoctor,
};