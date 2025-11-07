// src/screens/doctor/PrescriptionScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';
import PrescriptionViewModal from '../../components/doctor/PrescriptionViewModal'; // <-- IMPORT MỚI
import '../admin/AdminCRUD.css';

const formatDateTime = (isoString) => new Date(isoString).toLocaleString('vi-VN');

const PrescriptionScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State cho Form (Tạo mới)
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // State cho Modal (Xem)
  const [viewingPrescription, setViewingPrescription] = useState(null); // <-- STATE MỚI
  
  // State để lưu các đơn thuốc đã tồn tại
  const [existingPrescriptions, setExistingPrescriptions] = useState(new Map());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await appointmentService.getDoctorAppointments();
      const allAppts = res.data;
      
      const doneAppts = allAppts
        .filter(a => a.status === 'done')
        .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
        
      setAppointments(doneAppts);

      const presMap = new Map();
      for (const appt of doneAppts) {
        try {
          // API 'getPrescriptionByAppointment' đã populate đầy đủ
          const presRes = await prescriptionService.getPrescriptionByAppointment(appt._id);
          if (presRes.data) {
            presMap.set(appt._id, presRes.data);
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.warn(`Lỗi khi kiểm tra đơn thuốc cho ${appt._id}`, err);
          }
        }
      }
      setExistingPrescriptions(presMap);

    } catch (err) {
      setError('Lỗi tải dữ liệu: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
  };
  
  const handleSaveSuccess = () => {
    setSelectedAppointment(null);
    loadData(); // Tải lại
  };
  
  // Mở modal xem chi tiết
  const handleViewPrescription = (appointment) => {
    const prescription = existingPrescriptions.get(appointment._id);
    setViewingPrescription(prescription);
  };

  return (
    <div className="admin-crud-screen">
      <div className="screen-header">
        <h1>Kê đơn thuốc</h1>
      </div>

      {/* 1. Hiển thị Form Kê đơn (nếu đang tạo) */}
      {selectedAppointment && (
        <div>
          <button onClick={() => setSelectedAppointment(null)} className="btn-cancel">
            &laquo; Quay lại danh sách
          </button>
          <PrescriptionForm
            appointment={selectedAppointment}
            onSaveSuccess={handleSaveSuccess}
          />
        </div>
      )}

      {/* 2. Hiển thị Bảng (nếu không tạo) */}
      {!selectedAppointment && (
        <>
          {loading && <div>Đang tải...</div>}
          {error && <div className="error-message">{error}</div>}
          
          <h3>Chọn lịch hẹn đã hoàn thành để kê đơn:</h3>
          
          <table className="crud-table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Thời gian khám</th>
                <th>Trạng thái Đơn thuốc</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appt) => {
                  const hasPrescription = existingPrescriptions.has(appt._id);
                  return (
                    <tr key={appt._id}>
                      <td>{appt.userId?.username || 'N/A'}</td>
                      <td>{formatDateTime(appt.scheduledAt)}</td>
                      <td>
                        {/* --- SỬA LOGIC NÚT BẤM --- */}
                        {hasPrescription ? (
                          <button 
                            onClick={() => handleViewPrescription(appt)} 
                            className="btn-save" // Màu xanh
                          >
                            Xem Đơn thuốc
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSelectAppointment(appt)} 
                            className="btn-edit" // Màu vàng
                          >
                            Bắt đầu Kê đơn
                          </button>
                        )}
                        {/* --- KẾT THÚC SỬA --- */}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>
                    Không có lịch hẹn nào "Hoàn thành" chờ kê đơn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* 3. Modal Xem đơn thuốc (luôn render, nhưng bị ẩn) */}
      <PrescriptionViewModal
        isOpen={!!viewingPrescription}
        onClose={() => setViewingPrescription(null)}
        prescription={viewingPrescription}
      />
    </div>
  );
};

export default PrescriptionScreen;