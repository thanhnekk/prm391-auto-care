// src/components/admin/AppointmentEditModal.jsx
import React, { useState, useEffect } from 'react';
import './FormModal.css';

// === BƯỚC 1: TẠO HÀM HELPER ===
// Hàm này chuyển đổi "2025-11-10T10:00:00.000Z" (UTC)
// thành "2025-11-10T17:00" (Local, để input hiểu)
const convertToLocalInputString = (isoString) => {
  if (!isoString) return '';
  
  const date = new Date(isoString); // 1. Chuyển thành Date object (giờ local)
  
  // 2. Lấy các thành phần của giờ local
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 vì tháng 0-11
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // 3. Trả về format YYYY-MM-DDTHH:mm
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AppointmentEditModal = ({ isOpen, onClose, onSave, appointment }) => {
  const [formData, setFormData] = useState({
    status: 'pending',
    scheduledAt: '',
  });

  useEffect(() => {
    if (appointment) {
      // === BƯỚC 2: SỬA DÒNG NÀY ===
      setFormData({
        status: appointment.status,
        // Dùng hàm helper để lấy đúng giờ local
        scheduledAt: convertToLocalInputString(appointment.scheduledAt)
      });
    }
  }, [appointment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // === BƯỚC 3: KHÔNG CẦN SỬA GÌ Ở ĐÂY ===
    // Khi lưu, 'formData.scheduledAt' là chuỗi "2025-11-10T17:00" (local)
    // new Date("2025-11-10T17:00") -> Tạo Date object (local 17:00)
    // .toISOString() -> Tự động chuyển về UTC "2025-11-10T10:00:00.000Z" (ĐÚNG)
    const dataToSave = {
      status: formData.status,
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
              value={formData.scheduledAt} // Giờ đã hiển thị đúng (17:00)
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