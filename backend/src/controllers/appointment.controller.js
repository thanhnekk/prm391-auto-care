// controllers/appointment.controller.js
const AppointmentService = require("../services/appointment.service");

const createAppointment = async (req, res, next) => {
    try {
        const appt = await AppointmentService.createAppointment({ ...req.body, userId: req.user.id });
        res.status(201).json(appt);
    } catch (err) { next(err); }
};

const payAppointment = async (req, res, next) => {
    try {
        const appt = await AppointmentService.payAppointment(req.params.id);
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

module.exports = { createAppointment, payAppointment, cancelAppointment, completeAppointment, getAppointmentsByUser };
