// src/services/doctorService.js
import baseAxios from '../api/axios';

// Lấy danh sách (cho Dashboard & Admin Table)
const adminGetAllDoctors = (params) => {
  // params = { page, limit, search }
  return baseAxios.get('/doctors/admin', { params });
};

// Lấy tất cả (cho Doctor Dashboard - đã dùng)
const getAllDoctors = () => {
  return baseAxios.get('/doctors');
}

// Cập nhật hồ sơ (gán chuyên môn, dịch vụ)
const adminUpdateDoctor = (id, data) => {
  // id là ID của HỒ SƠ DOCTOR (không phải userId)
  // data = { specialization, experience, serviceTypeIds: [...] }
  return baseAxios.put(`/doctors/admin/${id}`, data);
};

// Xóa hồ sơ (backend tự động hạ quyền user)
const adminDeleteDoctor = (id) => {
  return baseAxios.delete(`/doctors/admin/${id}`);
};

export const doctorService = {
  adminGetAllDoctors,
  getAllDoctors,
  adminUpdateDoctor, // Thêm
  adminDeleteDoctor, // Thêm
};