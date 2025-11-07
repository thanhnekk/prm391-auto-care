// src/components/admin/AppointmentEditModal.jsx
import React, { useState, useEffect } from 'react';
import './FormModal.css';

// Component này đơn giản vì Admin có toàn quyền
const AppointmentEditModal = ({ isOpen, onClose, onSave, appointment }) => {
  const [formData, setFormData] = useState({
    status: 'pending',
    scheduledAt: '',
  });

  useEffect(() => {
    if (appointment) {
        let localTime = '';
      if (appointment.scheduledAt) {
        const date = new Date(appointment.scheduledAt);
        date.setHours(date.getHours() + 7); // UTC -> VN
        localTime = date.toISOString().slice(0, 16);
      }
      setFormData({
        status: appointment.status,
        // Format lại date cho input datetime-local
        scheduledAt: appointment.scheduledAt 
          ? new Date(appointment.scheduledAt).toISOString().slice(0, 16) 
          : '',
        // Bạn có thể thêm doctorId, ... ở đây nếu muốn
      });
    }
  }, [appointment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gửi đi dữ liệu đã thay đổi
    const dataToSave = {
      status: formData.status,
      // Gửi về dạng ISO string
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
    };
    onSave(appointment._id, dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Can thiệp Lịch hẹn</h2>
        <p>ID: {appointment._id}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trạng thái</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
            >
              <option value="pending">Pending (Chờ)</option>
              <option value="confirmed">Confirmed (Xác nhận)</option>
              <option value="canceled">Canceled (Đã hủy)</option>
              <option value="done">Done (Hoàn thành)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ngày hẹn (Scheduled At)</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-save">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentEditModal;