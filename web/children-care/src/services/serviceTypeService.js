// src/services/serviceTypeService.js
import baseAxios from '../api/axios';

// Lấy tất cả (cho bảng)
const getAllServices = () => {
  return baseAxios.get('/servicetypes');
};

// Lấy 1 dịch vụ (nếu cần)
const getServiceById = (id) => {
  return baseAxios.get(`/servicetypes/${id}`);
};

// Tạo mới
const createService = (data) => {
  // data = { name, description, price }
  return baseAxios.post('/servicetypes', data);
};

// Cập nhật
const updateService = (id, data) => {
  return baseAxios.put(`/servicetypes/${id}`, data);
};

// Xóa
const deleteService = (id) => {
  return baseAxios.delete(`/servicetypes/${id}`);
};

export const serviceTypeService = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};