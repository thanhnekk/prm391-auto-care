// src/services/prescriptionService.js
import baseAxios from '../api/axios';

// Tạo đơn thuốc mới
const createPrescription = (data) => {
  // data = { appointmentId, doctorName, notes, medicines: [...] }
  return baseAxios.post('/prescriptions', data);
};

// Lấy đơn thuốc BẰNG APPOINTMENT ID
// (Để kiểm tra xem lịch hẹn đã được kê đơn chưa)
const getPrescriptionByAppointment = (appointmentId) => {
  return baseAxios.get(`/prescriptions/by-appointment/${appointmentId}`);
};

export const prescriptionService = {
  createPrescription,
  getPrescriptionByAppointment,
};