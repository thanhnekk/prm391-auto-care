// src/screens/admin/DoctorManagementScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { doctorService } from '../../services/doctorService';
import Pagination from '../../components/common/Pagination';
import DoctorEditModal from '../../components/admin/DoctorEditModal';
import './AdminCRUD.css';

const DoctorManagementScreen = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // State cho Phân trang và Lọc
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
  });

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: pagination.currentPage,
        limit: 10,
        search: filters.search || undefined,
      };

      const response = await doctorService.adminGetAllDoctors(params);
      
      setDoctors(response.data.doctors);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalDoctors: response.data.totalDoctors,
      });

    } catch (err) {
      setError('Lỗi tải dữ liệu bác sĩ: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleFilterChange = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // loadDoctors sẽ tự chạy vì `filters` thay đổi
  };

  // Mở modal
  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  // Xử lý "Lưu" từ Modal
  const handleSave = async (id, data) => {
    try {
      await doctorService.adminUpdateDoctor(id, data);
      setIsModalOpen(false);
      loadDoctors(); // Tải lại
    } catch (err) {
      console.error(err);
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xử lý "Xóa"
  const handleDelete = async (doctor) => {
    if (window.confirm(`Bạn có chắc muốn xóa hồ sơ bác sĩ ${doctor.userId?.email}? 
        Hành động này sẽ hạ quyền tài khoản user về 'user'.`)) {
      try {
        await doctorService.adminDeleteDoctor(doctor._id);
        loadDoctors(); // Tải lại
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="admin-crud-screen">
      <div className="screen-header">
        <h1>Quản lý Bác sĩ ({pagination.totalDoctors})</h1>
      </div>

      {/* --- BỘ LỌC --- */}
      <form onSubmit={handleFilterSubmit} className="filter-form">
        <input 
          type="text"
          name="search"
          placeholder="Tìm theo email/tên bác sĩ..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <button type="submit">Lọc</button>
      </form>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tên (Username)</th>
                <th>Chuyên môn</th>
                <th>Kinh nghiệm</th>
                <th>Dịch vụ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.userId?.email}</td>
                  <td>{doctor.userId?.username}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.experience} năm</td>
                  <td>{doctor.serviceTypeIds?.length || 0}</td>
                  <td>
                    <button onClick={() => handleEdit(doctor)} className="btn-edit">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(doctor)} className="btn-delete">
                      Xóa
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
      <DoctorEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorManagementScreen;