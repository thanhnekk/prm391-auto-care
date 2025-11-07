// src/components/layout/Sidebar.jsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { useAuth } from '../../context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

// Import các icon bạn cần
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  EditOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

// Helper để tạo item menu (cho gọn)
const getItem = (label, key, icon, children) => ({
  key,
  icon,
  children,
  label,
});

const Sidebar = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Định nghĩa menu cho Admin ---
  const adminItems = [
    getItem('Dashboard', '/', <DashboardOutlined />),
    getItem('Quản lý Hệ thống', 'admin_group', <UserOutlined />, [
      getItem('Người dùng', '/admin/users', <TeamOutlined />),
      getItem('Bác sĩ', '/admin/doctors', <HeartOutlined />),
      getItem('Dịch vụ', '/admin/services', <ShopOutlined />),
      getItem('Thuốc', '/admin/medicines', <MedicineBoxOutlined />),
    ]),
    getItem('Quản lý Vận hành', 'ops_group', <CalendarOutlined />, [
      getItem('Lịch hẹn', '/admin/appointments', <CalendarOutlined />),
    ]),
  ];

  // --- Định nghĩa menu cho Doctor ---
  const doctorItems = [
    getItem('Dashboard', '/', <DashboardOutlined />),
    getItem('Nghiệp vụ', 'doctor_group', <HeartOutlined />, [
      getItem('Lịch làm việc', '/doctor/schedule', <CalendarOutlined />),
      getItem('Kê đơn thuốc', '/doctor/prescriptions', <EditOutlined />),
    ]),
  ];

  const items = auth.user.role === 'admin' ? adminItems : doctorItems;

  return (
    // Sider của antd, theme="light" (sáng màu)
    <Sider width={250} theme="light" collapsible>
      <div className="sidebar-logo" style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 64,
  fontSize: 20,
  fontWeight: 600,
  color: '#1677ff',
  borderBottom: '1px solid #f0f0f0',
}}>
  <DashboardOutlined style={{ fontSize: 24, marginRight: 8, color: '#1677ff' }} />
  <span>Admin Portal</span>
</div>
      <Menu
        mode="inline"
        // Tự động chọn item khớp với URL
        selectedKeys={[location.pathname]} 
        // Mở sẵn các Sub-menu
        defaultOpenKeys={['admin_group', 'ops_group', 'doctor_group']}
        style={{ borderRight: 0 }}
        items={items}
        // Xử lý khi bấm vào menu
        onClick={({ key }) => {
          navigate(key);
        }}
      />
    </Sider>
  );
};

export default Sidebar;