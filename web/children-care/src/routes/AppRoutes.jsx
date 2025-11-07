import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ServiceManagementScreen from '../screens/admin/ServiceManagementScreen';
import MedicineManagementScreen from '../screens/admin/MedicineManagementScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import DoctorManagementScreen from '../screens/admin/DoctorManagementScreen';
import AppointmentManagementScreen from '../screens/admin/AppointmentManagementScreen';
import MyScheduleScreen from '../screens/doctor/MyScheduleScreen';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginScreen />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<DashboardScreen />} />
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="admin/users" element={<UserManagementScreen />} />
        <Route path="admin/medicines" element={<MedicineManagementScreen />} />
        <Route path="admin/doctors" element={<DoctorManagementScreen/>} />
        <Route path="admin/services" element={<ServiceManagementScreen />} />
        <Route path="admin/appointments" element={<AppointmentManagementScreen />} />
        <Route path="doctor/schedule" element={<MyScheduleScreen/>} />
        <Route path="doctor/prescriptions" element={<PrescriptionScreen/>} />
        <Route path="*" element={<div>404 - Trang không tồn tại</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
