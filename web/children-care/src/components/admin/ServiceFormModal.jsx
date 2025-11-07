// src/components/admin/ServiceFormModal.jsx
import React, { useState, useEffect } from 'react';
import './FormModal.css'; // File CSS cho Modal

const ServiceFormModal = ({ isOpen, onClose, onSave, service }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
  });
  const [error, setError] = useState('');

  // Khi `service` prop thay đổi (khi bấm "Edit"),
  // cập nhật state của form
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
      });
    } else {
      // Reset form khi tạo mới
      setFormData({ name: '', description: '', price: 0 });
    }
  }, [service, isOpen]); // Chạy lại khi mở modal hoặc service thay đổi

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) {
      setError('Tên dịch vụ và Giá (lớn hơn 0) là bắt buộc.');
      return;
    }
    
    // Gọi hàm onSave được truyền từ cha
    onSave(formData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{service ? 'Chỉnh sửa Dịch vụ' : 'Tạo Dịch vụ mới'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label>Tên dịch vụ *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Giá (VNĐ) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
            />
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

export default ServiceFormModal;