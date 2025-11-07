// src/screens/DashboardScreen.jsx
import React from 'react';
import { useAuth } from '../context/AuthProvider';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import DoctorDashboard from '../components/dashboard/DoctorDashboard';

const DashboardScreen = () => {
  const { auth } = useAuth();

  return (
    <div className="dashboard-screen">
      <h1>Chào mừng, {auth.user?.username}!</h1>
      
      {/* Phân quyền hiển thị component con
        dựa trên role lấy từ context
      */}
      {auth.user?.role === 'admin' && <AdminDashboard />}
      {auth.user?.role === 'doctor' && <DoctorDashboard />}
    </div>
  );
};

export default DashboardScreen;