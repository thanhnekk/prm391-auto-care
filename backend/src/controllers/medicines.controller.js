// backend/src/controllers/medicines.controller.js
const MedicineService = require('../services/medicines.service');

// Cho Bác sĩ/Admin
const getAllMedicines = async (req, res, next) => {
  try {
    const medicines = await MedicineService.getAllMedicines(req.query);
    res.status(200).json(medicines);
  } catch (err) { next(err); }
};

// Cho Admin
const createMedicine = async (req, res, next) => {
  try {
    const medicine = await MedicineService.createMedicine(req.body);
    res.status(201).json(medicine);
  } catch (err) { next(err); }
};

// Cho Admin
const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await MedicineService.updateMedicine(req.params.id, req.body);
    res.status(200).json(medicine);
  } catch (err) { next(err); }
};

// Cho Admin
const deleteMedicine = async (req, res, next) => {
  try {
    const result = await MedicineService.deleteMedicine(req.params.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
};