// src/routes/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { auth, loading } = useAuth(); // Lấy auth (chứa user) và loading
  const location = useLocation();

  if (loading) {
    // Nếu đang check token (lúc tải lại trang), thì hiện loading...
    return <div>Loading session...</div>;
  }

  // 1. User CÓ TỒN TẠI và role là 'admin' HOẶC 'doctor'
  if (auth?.user && (auth.user.role === 'admin' || auth.user.role === 'doctor')) {
    console.log(auth)
    return children; // Cho phép vào
  }
  // 2. User không tồn tại HOẶC không đúng quyền
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;