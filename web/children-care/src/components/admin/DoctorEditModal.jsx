// src/components/admin/DoctorEditModal.jsx
import React, { useState, useEffect } from 'react';
import { serviceTypeService } from '../../services/serviceTypeService'; // Lấy danh sách dịch vụ
import './FormModal.css'; // Tái sử dụng CSS
import './DoctorEditModal.css'; // CSS riêng cho checkbox

const DoctorEditModal = ({ isOpen, onClose, onSave, doctor }) => {
  // 1. State cho Form
  const [formData, setFormData] = useState({
    specialization: '',
    experience: 0,
  });
  // 2. State cho danh sách tất cả dịch vụ (lấy từ API)
  const [allServices, setAllServices] = useState([]); 
  // 3. State cho các dịch vụ ĐÃ ĐƯỢC CHỌN
  const [selectedServiceIds, setSelectedServiceIds] = useState(new Set());
  
  const [loadingServices, setLoadingServices] = useState(true);

  // Lần đầu tiên: Tải danh sách tất cả dịch vụ
  useEffect(() => {
    const loadAllServices = async () => {
      try {
        const res = await serviceTypeService.getAllServices();
        setAllServices(res.data);
      } catch (err) {
        console.error("Lỗi tải danh sách dịch vụ", err);
      } finally {
        setLoadingServices(false);
      }
    };
    loadAllServices();
  }, []);

  // Khi `doctor` prop thay đổi (khi bấm "Edit"),
  // cập nhật state của form
  useEffect(() => {
    if (doctor) {
      setFormData({
        specialization: doctor.specialization || '',
        experience: doctor.experience || 0,
      });
      // Cập nhật các checkbox đã chọn
      const selectedIds = new Set(
        doctor.serviceTypeIds.map(service => service._id)
      );
      setSelectedServiceIds(selectedIds);
    }
  }, [doctor, isOpen]);

  // Xử lý thay đổi input text/number
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý check/uncheck dịch vụ
  const handleServiceToggle = (serviceId) => {
    const newSelectedIds = new Set(selectedServiceIds);
    if (newSelectedIds.has(serviceId)) {
      newSelectedIds.delete(serviceId); // Uncheck
    } else {
      newSelectedIds.add(serviceId); // Check
    }
    setSelectedServiceIds(newSelectedIds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      serviceTypeIds: Array.from(selectedServiceIds), // Chuyển Set về mảng
    };
    onSave(doctor._id, finalData); // doctor._id là ID của HỒ SƠ Bác sĩ
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Chỉnh sửa Bác sĩ: {doctor.userId?.email}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chuyên môn</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Năm kinh nghiệm</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Các dịch vụ được phép:</label>
            {loadingServices ? (
              <div>Đang tải dịch vụ...</div>
            ) : (
              <div className="checkbox-group">
                {allServices.map(service => (
                  <label key={service._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.has(service._id)}
                      onChange={() => handleServiceToggle(service._id)}
                    />
                    {service.name} ({service.price.toLocaleString('vi-VN')}đ)
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-save">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorEditModal;