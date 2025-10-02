// controllers/doctor.controller.js
const DoctorService = require("../services/doctor.service");

const getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await DoctorService.getAllDoctors();
        res.status(200).json(doctors);
    } catch (err) { next(err); }
};

const getDoctorById = async (req, res, next) => {
    try {
        const doctor = await DoctorService.getDoctorById(req.params.id);
        res.status(200).json(doctor);
    } catch (err) { next(err); }
};

const addService = async (req, res, next) => {
    try {
        const doctor = await DoctorService.addServiceToDoctor(req.params.id, req.body.serviceTypeId);
        res.status(200).json(doctor);
    } catch (err) { next(err); }
};

const getDoctorsByService = async (req, res, next) => {
    try {
        const serviceId = req.params.serviceId;
        const doctors = await DoctorService.getDoctorsByService(serviceId);
        res.status(200).json(doctors);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    addService,
    getDoctorsByService, // export hàm mới
};