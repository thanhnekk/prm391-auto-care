// src/screens/admin/ServiceManagementScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { serviceTypeService } from '../../services/serviceTypeService';
import ServiceFormModal from '../../components/admin/ServiceFormModal';
import './AdminCRUD.css'; // File CSS chung cho các bảng Admin

const ServiceManagementScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // null = tạo mới

  // Hàm tải dữ liệu (dùng useCallback để tránh re-render)
  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await serviceTypeService.getAllServices();
      setServices(response.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải dữ liệu lần đầu khi component mount
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Mở modal để tạo mới
  const handleCreate = () => {
    setSelectedService(null); // Đặt là null để form biết là "tạo mới"
    setIsModalOpen(true);
  };

  // Mở modal để chỉnh sửa
  const handleEdit = (service) => {
    setSelectedService(service); // Gửi service đang chọn vào form
    setIsModalOpen(true);
  };

  // Xử lý khi bấm nút "Lưu" trên Modal
  const handleSave = async (formData) => {
    try {
      if (selectedService) {
        // Cập nhật
        await serviceTypeService.updateService(selectedService._id, formData);
      } else {
        // Tạo mới
        await serviceTypeService.createService(formData);
      }
      setIsModalOpen(false);
      loadServices(); // Tải lại bảng
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xử lý khi bấm nút "Xóa"
  const handleDelete = async (serviceId) => {
    if (window.confirm('Bạn có chắc muốn xóa dịch vụ này không?')) {
      try {
        await serviceTypeService.deleteService(serviceId);
        loadServices(); // Tải lại bảng
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="admin-crud-screen">
      <div className="screen-header">
        <h1>Quản lý Dịch vụ</h1>
        <button onClick={handleCreate} className="btn-create">
          + Thêm mới
        </button>
      </div>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <table className="crud-table">
          <thead>
            <tr>
              <th>Tên Dịch vụ</th>
              <th>Mô tả</th>
              <th>Giá (VNĐ)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>{service.name}</td>
                <td>{service.description}</td>
                <td>{service.price.toLocaleString('vi-VN')}</td>
                <td>
                  <button onClick={() => handleEdit(service)} className="btn-edit">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(service._id)} className="btn-delete">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Form */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        service={selectedService} // Truyền service cần sửa, hoặc null
      />
    </div>
  );
};

export default ServiceManagementScreen;