// src/services/medicineService.js
import baseAxios from '../api/axios';

// Lấy tất cả (cho bảng và cho bác sĩ tìm kiếm)
// (Backend của bạn có /medicines chứ không phải /admin/medicines)
const getAllMedicines = (search = '') => {
  return baseAxios.get('/medicines', {
    params: { search },
  });
};

// Tạo mới
const createMedicine = (data) => {
  // data = { name, unit, description }
  return baseAxios.post('/medicines', data);
};

// Cập nhật
const updateMedicine = (id, data) => {
  return baseAxios.put(`/medicines/${id}`, data);
};

// Xóa
const deleteMedicine = (id) => {
  return baseAxios.delete(`/medicines/${id}`);
};

export const medicineService = {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};