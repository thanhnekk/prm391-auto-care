// src/services/userService.js
import baseAxios from '../api/axios';

// Lấy danh sách (có phân trang/lọc)
const adminGetAllUsers = (params) => {
  // params = { page, limit, search, role, status }
  return baseAxios.get('/users/admin', { params });
};

// Cập nhật (Phân quyền/Trạng thái)
const adminUpdateUser = (id, data) => {
  // data = { role, status }
  return baseAxios.put(`/users/admin/${id}`, data);
};

// Xóa mềm (cập nhật status: 'deleted')
const adminDeleteUser = (id) => {
  return baseAxios.delete(`/users/admin/${id}`);
};

export const userService = {
  adminGetAllUsers,
  adminUpdateUser,
  adminDeleteUser,
};