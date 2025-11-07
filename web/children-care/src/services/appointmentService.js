// src/services/appointmentService.js
import baseAxios from '../api/axios';

// API lấy danh sách lịch hẹn (có phân trang) cho Admin
const adminGetAllAppointments = (params) => {
  // params có thể là { page, limit, status, date, doctorId }
  return baseAxios.get('/appointments/admin', { params });
};

// API lấy lịch hẹn của 1 user 
const getMyAppointments = () => {
    return baseAxios.get('/appointments/my');
}

const getDoctorAppointments = () => {
    return baseAxios.get('appointments/doctor/my');
};

const adminUpdateAppointment = (id, data) => {
  // data = { status, scheduledAt, doctorId, ... }
  return baseAxios.put(`/appointments/admin/${id}`, data);
};

const completeAppointment = (id) => {
  return baseAxios.post(`/appointments/${id}/complete`);
};

export const appointmentService = {
  adminGetAllAppointments,
  getMyAppointments,
  getDoctorAppointments, 
  adminUpdateAppointment,
  completeAppointment
};