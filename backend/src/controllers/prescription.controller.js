// controllers/prescription.controller.js
const PrescriptionService = require("../services/prescription.service");

const createPrescription = async (req, res, next) => {
    try {
        const presc = await PrescriptionService.createPrescription(req.body);
        res.status(201).json(presc);
    } catch (err) { next(err); }
};

const addMedicine = async (req, res, next) => {
    try {
        const med = await PrescriptionService.addMedicine({ prescriptionId: req.params.id, ...req.body });
        res.status(201).json(med);
    } catch (err) { next(err); }
};

module.exports = { createPrescription, addMedicine };
