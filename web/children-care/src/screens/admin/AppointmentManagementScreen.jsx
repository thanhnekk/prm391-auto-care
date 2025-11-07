// src/screens/admin/AppointmentManagementScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService'; // Để lọc
import Pagination from '../../components/common/Pagination';
import AppointmentEditModal from '../../components/admin/AppointmentEditModal';
import './AdminCRUD.css';

// Helper format ngày
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('vi-VN');
};

const AppointmentManagementScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // State cho Phân trang và Lọc
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAppointments: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    doctorId: '',
  });
  
  // State cho các dropdown của bộ lọc
  const [doctorList, setDoctorList] = useState([]);

  // Tải danh sách bác sĩ (chỉ 1 lần)
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const docRes = await doctorService.adminGetAllDoctors({ limit: 1000 }); // Lấy hết
        setDoctorList(docRes.data.doctors);
      } catch (err) {
        console.error("Lỗi tải danh sách bác sĩ:", err);
      }
    };
    loadFilterData();
  }, []);

  // Hàm tải dữ liệu chính
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...filters,
      };
      // Lọc bỏ các giá trị rỗng
      Object.keys(params).forEach(key => 
        (params[key] === '' || params[key] === null) && delete params[key]
      );

      const response = await appointmentService.adminGetAllAppointments(params);
      
      setAppointments(response.data.appointments);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalAppointments: response.data.totalAppointments,
      });

    } catch (err) {
      setError('Lỗi tải dữ liệu lịch hẹn: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]); // Chạy lại khi trang hoặc bộ lọc thay đổi

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Bấm nút Lọc
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Quay về trang 1
    loadAppointments(); // Sẽ tự chạy vì deps
  };
  
  // Mở modal
  const handleEdit = (appointment) => {
    setSelectedAppt(appointment);
    setIsModalOpen(true);
  };

  // Xử lý "Lưu" từ Modal
  const handleSave = async (id, data) => {
    try {
      await appointmentService.adminUpdateAppointment(id, data);
      setIsModalOpen(false);
      loadAppointments(); // Tải lại
    } catch (err) {
      console.error(err);
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="admin-crud-screen">
      <div className="screen-header">
        <h1>Quản lý Lịch hẹn ({pagination.totalAppointments})</h1>
      </div>

      {/* --- BỘ LỌC --- */}
      <form onSubmit={handleFilterSubmit} className="filter-form">
        <input 
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Tất cả Trạng thái</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="canceled">Canceled</option>
          <option value="done">Done</option>
        </select>
        <select name="doctorId" value={filters.doctorId} onChange={handleFilterChange}>
          <option value="">Tất cả Bác sĩ</option>
          {doctorList.map(doc => (
            <option key={doc._id} value={doc._id}>
              {doc.userId?.username || doc.userId?.email}
            </option>
          ))}
        </select>
        <button type="submit">Lọc</button>
      </form>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Bác sĩ</th>
                <th>Dịch vụ</th>
                <th>Thời gian hẹn</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td>{appt.userId?.username || 'N/A'}</td>
                  <td>{appt.doctorId?.userId?.username || 'N/A'}</td>
                  <td>{appt.serviceTypeIds?.name}</td>
                  <td>{formatDateTime(appt.scheduledAt)}</td>
                  <td>
                    <span className={`status-badge status-${appt.status}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>{appt.paid ? 'Đã trả' : 'Chưa'} ({appt.paymentMethod})</td>
                  <td>
                    <button onClick={() => handleEdit(appt)} className="btn-edit">
                      Can thiệp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal Form */}
      <AppointmentEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        appointment={selectedAppt}
      />
    </div>
  );
};

export default AppointmentManagementScreen;