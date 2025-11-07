// src/components/admin/MedicineFormModal.jsx
import React, { useState, useEffect } from 'react';
import './FormModal.css'; 

const MedicineFormModal = ({ isOpen, onClose, onSave, medicine }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'Viên', 
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        unit: medicine.unit || 'Viên',
        description: medicine.description || '',
      });
    } else {
      // Reset form khi tạo mới
      setFormData({ name: '', unit: 'Viên', description: '' });
    }
  }, [medicine, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit) {
      setError('Tên thuốc và Đơn vị là bắt buộc.');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{medicine ? 'Chỉnh sửa Thuốc' : 'Thêm Thuốc mới'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label>Tên thuốc (VD: Paracetamol 500mg) *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Đơn vị *</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Viên, Gói, Chai..."
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

export default MedicineFormModal;