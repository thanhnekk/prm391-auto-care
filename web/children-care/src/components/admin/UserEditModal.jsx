// src/components/admin/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider'; // Import useAuth
import './FormModal.css'; // Tái sử dụng CSS

const UserEditModal = ({ isOpen, onClose, onSave, user }) => {
  const { auth } = useAuth(); // Lấy thông tin admin đang đăng nhập
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');

  // Kiểm tra xem có đang sửa chính mình không
  const isEditingSelf = user?._id === auth.user.id;

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Backend đã chặn, nhưng chúng ta cũng nên chặn ở UI
    if (isEditingSelf && (role !== auth.user.role || status !== 'active')) {
      setError('Không thể tự thay đổi vai trò hoặc trạng thái của chính mình.');
      return;
    }
    
    onSave(user._id, { role, status });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Cập nhật Người dùng: {user.email}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label>Vai trò (Role)</label>
            <select 
              name="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              disabled={isEditingSelf} // Vô hiệu hóa nếu tự sửa
            >
              <option value="user">User (Bệnh nhân)</option>
              <option value="doctor">Doctor (Bác sĩ)</option>
              <option value="admin">Admin (Quản trị)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Trạng thái (Status)</label>
            <select 
              name="status" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              disabled={isEditingSelf} // Vô hiệu hóa nếu tự sửa
            >
              <option value="active">Active (Đang hoạt động)</option>
              <option value="locked">Locked (Đã khóa)</option>
              <option value="deleted">Deleted (Đã xóa)</option>
            </select>
            {isEditingSelf && <small>Bạn không thể tự khóa chính mình.</small>}
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

export default UserEditModal;