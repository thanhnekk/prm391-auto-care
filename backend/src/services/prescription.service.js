// services/prescription.service.js
const Prescription = require("../models/prescription.model.js");
const Medicine = require("../models/medicines.model.js");
const BaseError = require("../utils/BaseError.js");
const { StatusCodes } = require("http-status-codes");

// Tạo prescription
const createPrescription = async ({ appointmentId, doctorName, notes }) => {
    const prescription = new Prescription({ appointmentId, doctorName, notes });
    await prescription.save();
    return prescription;
};

// Thêm medicine
const addMedicine = async ({ prescriptionId, name, dosage, duration }) => {
    const medicine = new Medicine({ prescriptionId, name, dosage, duration });
    await medicine.save();
    return medicine;
};

// Lấy prescription theo appointment
const getPrescriptionByAppointment = async (appointmentId) => {
    return await Prescription.findOne({ appointmentId }).populate("medicines");
};

module.exports = { createPrescription, addMedicine, getPrescriptionByAppointment };
