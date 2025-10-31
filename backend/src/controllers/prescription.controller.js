// backend/src/controllers/prescription.controller.js
const PrescriptionService = require("../services/prescription.service");

// (Dành cho Doctor)
const createPrescription = async (req, res, next) => {
    try {
        const presc = await PrescriptionService.createPrescription(req.body);
        res.status(201).json(presc);
    } catch (err) { next(err); }
};

// (Dành cho Doctor)
const updatePrescription = async (req, res, next) => {
    try {
        const presc = await PrescriptionService.updatePrescription(req.params.id, req.body);
        res.status(200).json(presc);
    } catch (err) { next(err); }
};

// (Dành cho User/Doctor)
const getPrescriptionByAppointment = async (req, res, next) => {
    try {
        const presc = await PrescriptionService.getPrescriptionByAppointment(req.params.appointmentId);
        res.status(200).json(presc);
    } catch (err) { next(err); }
};

// (Dành cho Admin)
const adminGetPrescriptionById = async (req, res, next) => {
    try {
        const result = await PrescriptionService.adminGetPrescriptionById(req.params.id);
        res.status(200).json(result);
    } catch (err) { next(err); }
};

// (Dành cho Admin)
const adminGetAllPrescriptions = async (req, res, next) => {
    try {
        const result = await PrescriptionService.adminGetAllPrescriptions(req.query);
        res.status(200).json(result);
    } catch (err) { next(err); }
};

// (Dành cho Admin)
const adminDeletePrescription = async (req, res, next) => {
    try {
        const result = await PrescriptionService.adminDeletePrescription(req.params.id);
        res.status(200).json(result);
    } catch (err) { next(err); }
};

module.exports = {
    createPrescription,
    updatePrescription,
    getPrescriptionByAppointment,
    adminGetPrescriptionById,
    adminGetAllPrescriptions,
    adminDeletePrescription,
};