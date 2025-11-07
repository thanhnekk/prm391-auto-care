// src/screens/doctor/MyScheduleScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
// IMPORT SERVICE ĐÃ CẬP NHẬT
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthProvider';
import '../admin/AdminCRUD.css'; // Tái sử dụng CSS
import { useNavigate } from 'react-router-dom'; 
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('vi-VN');
};

const MyScheduleScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentService.getDoctorAppointments();
      setAppointments(response.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu lịch hẹn: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleComplete = async (apptId) => {
    // Hỏi xác nhận
    if (window.confirm('Bạn có chắc muốn đánh dấu lịch hẹn này là ĐÃ HOÀN THÀNH?')) {
      try {
        await appointmentService.completeAppointment(apptId);
        loadAppointments(); // Tải lại danh sách
      } catch (err) {
        console.error("Lỗi khi hoàn thành APM:", err);
        alert('Lỗi: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="admin-crud-screen">
      <div className="screen-header">
        <h1>Lịch làm việc của tôi</h1>
      </div>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <table className="crud-table">
          <thead>
            <tr>
              <th>Bệnh nhân</th>
              <th>Dịch vụ</th>
              <th>Thời gian hẹn</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <tr key={appt._id}>
                  <td>{appt.userId?.username || 'N/A'}</td>
                  <td>{appt.serviceTypeIds?.name || 'N/A'}</td>
                  <td>{formatDateTime(appt.scheduledAt)}</td>
                  <td>
                    <span className={`status-badge status-${appt.status}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>{appt.paid ? 'Đã trả' : 'Chưa'} ({appt.paymentMethod})</td>
                  
                  <td>
                    {/* Chỉ hiện nút khi status là 'confirmed' */}
                    {appt.status === 'confirmed' && (
                      <button 
                        onClick={() => handleComplete(appt._id)} 
                        className="btn-save" // Màu xanh
                      >
                        Hoàn thành
                      </button>
                    )}
                    {/* Khi đã 'done' (hoàn thành), chờ kê đơn */}
                    {appt.status === 'done' && (
                       <button 
                         className="btn-edit" 
                          onClick={() => navigate(`/doctor/prescriptions`)}
                       >
                         Kê đơn
                       </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  Bạn chưa có lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyScheduleScreen;