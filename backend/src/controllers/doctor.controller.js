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

// Admin

const adminGetAllDoctors = async (req, res, next) => {
  try {
    const result = await DoctorService.adminGetAllDoctors(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const adminUpdateDoctor = async (req, res, next) => {
  try {
    const updatedDoctor = await DoctorService.adminUpdateDoctor(
      req.params.id, // ID của hồ sơ Doctor
      req.body
    );
    res.status(200).json({ message: "Cập nhật hồ sơ bác sĩ thành công", doctor: updatedDoctor });
  } catch (err) {
    next(err);
  }
};

const adminDeleteDoctor = async (req, res, next) => {
  try {
    const result = await DoctorService.adminDeleteDoctor(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  addService,
  getDoctorsByService,
  // --- Các hàm mới cho Admin ---
  adminGetAllDoctors,
  adminUpdateDoctor,
  adminDeleteDoctor,
};