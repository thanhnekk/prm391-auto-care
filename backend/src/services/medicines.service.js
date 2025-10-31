// backend/src/services/medicines.service.js
const Medicine = require('../models/medicines.model');
const BaseError = require('../utils/BaseError');
const { StatusCodes } = require('http-status-codes');

// Lấy danh sách (cho bác sĩ tìm kiếm)
const getAllMedicines = async (query) => {
  const filters = {};
  if (query.search) {
    filters.name = { $regex: query.search, $options: 'i' };
  }
  // Bác sĩ cần load hết để tìm, không phân trang
  return await Medicine.find(filters).sort({ name: 1 });
};

// Tạo thuốc mới (Admin)
const createMedicine = async (data) => {
  const { name, unit, description } = data;
  const existing = await Medicine.findOne({ name });
  if (existing) {
    throw new BaseError(StatusCodes.BAD_REQUEST, 'Tên thuốc này đã tồn tại');
  }
  const medicine = new Medicine({ name, unit, description });
  await medicine.save();
  return medicine;
};

// Cập nhật thuốc (Admin)
const updateMedicine = async (id, data) => {
  const medicine = await Medicine.findByIdAndUpdate(id, data, { new: true });
  if (!medicine) {
    throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy thuốc');
  }
  return medicine;
};

// Xóa thuốc (Admin)
const deleteMedicine = async (id) => {
  const medicine = await Medicine.findByIdAndDelete(id);
  if (!medicine) {
    throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy thuốc');
  }
  return { message: 'Xóa thuốc khỏi danh mục thành công' };
};

module.exports = {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
};