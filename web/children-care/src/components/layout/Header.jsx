// src/components/layout/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { authService } from '../../services/auth.service'; // Import service
import './Header.css';

const Header = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout(); // Gọi API logout (xóa cookie httpOnly)
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    } finally {
      // Dọn dẹp phía client
      setAuth({ accessToken: null, user: null }); // Xóa context
      localStorage.removeItem("accessToken"); // Xóa token
      navigate('/login'); // Về trang login
    }
  };

  return (
    <header className="header">
      <div className="header-info">
        {/* Thêm Breadcrumbs hoặc tiêu đề trang*/}
      </div>
      <div className="header-user">
        <span>Chào, {auth.user?.username || 'User'}!</span>
        <button onClick={handleLogout} className="logout-button">
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;