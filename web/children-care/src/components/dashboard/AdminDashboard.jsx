// src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Avatar } from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  DollarCircleOutlined,
  CrownOutlined, // Icon cho Admin
  AreaChartOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { userService } from '../../services/userService';
import { appointmentService } from '../../services/appointmentService';
import './Dashboard.css';

const { Title, Text } = Typography;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Xanh, Lục, Vàng

// [Helper 1: Xử lý dữ liệu Lịch hẹn]
const processAppointmentData = (appointments) => {
  const statusCounts = { pending: 0, confirmed: 0, canceled: 0, done: 0 };
  let totalRevenue = 0;
  let revenueToday = 0;
  
  // Chuẩn bị mảng 7 ngày gần nhất
  const revenue7Days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().split('T')[0]; // "YYYY-MM-DD"
    revenue7Days[dayKey] = { name: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), revenue: 0 };
  }
  
  const todayStr = new Date().toISOString().split('T')[0];

  appointments.forEach(appt => {
    // 1. Đếm trạng thái
    if (statusCounts[appt.status] !== undefined) {
      statusCounts[appt.status]++;
    }
    
    // 2. Tính doanh thu (chỉ khi đã thanh toán)
    if (appt.paid) {
      totalRevenue += appt.totalPrice;
      const paidDateStr = new Date(appt.updatedAt).toISOString().split('T')[0];
      
      // 3. Tính doanh thu hôm nay
      if (paidDateStr === todayStr) {
        revenueToday += appt.totalPrice;
      }
      
      // 4. Tính doanh thu 7 ngày
      if (revenue7Days[paidDateStr]) {
        revenue7Days[paidDateStr].revenue += appt.totalPrice;
      }
    }
  });

  const statusChartData = [
    { name: 'Chờ', count: statusCounts.pending },
    { name: 'Xác nhận', count: statusCounts.confirmed },
    { name: 'Hoàn thành', count: statusCounts.done },
    { name: 'Đã hủy', count: statusCounts.canceled },
  ];

  const revenueLineChartData = Object.values(revenue7Days);

  return { statusChartData, totalRevenue, revenueToday, revenueLineChartData };
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    revenueToday: 0,
  });
  
  const [statusChartData, setStatusChartData] = useState([]);
  const [roleChartData, setRoleChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Gọi 4 API chính song song
        const [
          patientRes, 
          doctorRes, 
          adminRes, 
          appointmentsRes
        ] = await Promise.all([
          userService.adminGetAllUsers({ role: 'user', limit: 1 }), // Lấy tổng số Bệnh nhân
          userService.adminGetAllUsers({ role: 'doctor', limit: 1 }), // Lấy tổng số Bác sĩ
          userService.adminGetAllUsers({ role: 'admin', limit: 1 }), // Lấy tổng số Admin
          appointmentService.adminGetAllAppointments({ limit: 2000 }) // Lấy 2000 lịch hẹn gần nhất
        ]);

        const { appointments, totalAppointments } = appointmentsRes.data;
        
        // Xử lý dữ liệu lịch hẹn
        const { 
          statusChartData, 
          totalRevenue, 
          revenueToday, 
          revenueLineChartData 
        } = processAppointmentData(appointments);
        
        // Xử lý dữ liệu vai trò
        const totalPatients = patientRes.data.totalUsers;
        const totalDoctors = doctorRes.data.totalUsers;
        const totalAdmins = adminRes.data.totalUsers;
        const roleData = [
          { name: 'Bệnh nhân', value: totalPatients },
          { name: 'Bác sĩ', value: totalDoctors },
          { name: 'Admin', value: totalAdmins },
        ];

        // Cập nhật tất cả state
        setStats({
          totalPatients,
          totalDoctors,
          totalAdmins,
          totalAppointments,
          totalRevenue,
          revenueToday,
        });
        
        setStatusChartData(statusChartData);
        setRoleChartData(roleData);
        setRevenueChartData(revenueLineChartData);

      } catch (error) {
        console.error("Lỗi lấy thống kê Admin:", error);
        message.error('Không thể tải dữ liệu thống kê.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Spin spinning={loading}>
      <div className="admin-dashboard">
        <Title level={3} style={{ marginBottom: 24 }}>Tổng quan Quản trị</Title>
        
        {/* --- Dàn Statistic Cards "Màu mè" --- */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="colorful-statistic-card">
              <Statistic
                title="Doanh thu Hôm nay"
                value={stats.revenueToday}
                precision={0}
                prefix={
                  <Avatar style={{ backgroundColor: '#52c41a' }} icon={<DollarCircleOutlined />} />
                }
                suffix="VNĐ"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="colorful-statistic-card">
              <Statistic
                title="Tổng Doanh thu"
                value={stats.totalRevenue}
                precision={0}
                prefix={
                  <Avatar style={{ backgroundColor: '#1890ff' }} icon={<DollarCircleOutlined />} />
                }
                suffix="VNĐ"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="colorful-statistic-card">
              <Statistic
                title="Bệnh nhân"
                value={stats.totalPatients}
                prefix={
                  <Avatar style={{ backgroundColor: '#faad14' }} icon={<UserOutlined />} />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="colorful-statistic-card">
              <Statistic
                title="Bác sĩ"
                value={stats.totalDoctors}
                prefix={
                  <Avatar style={{ backgroundColor: '#722ed1' }} icon={<HeartOutlined />} />
                }
              />
            </Card>
          </Col>
        </Row>
        
        {/* --- Hàng Biểu đồ (Line + Pie) --- */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Biểu đồ doanh thu 7 ngày */}
          <Col xs={24} lg={14}>
            <Card bordered={false} className="chart-container" style={{ height: 400 }}>
              <Title level={5}><AreaChartOutlined /> Doanh thu 7 ngày gần nhất</Title>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Biểu đồ tròn Phân loại tài khoản */}
          <Col xs={24} lg={10}>
            <Card bordered={false} className="chart-container" style={{ height: 400 }}>
              <div className="pie-chart-wrapper">
                <Title level={5}><PieChartOutlined /> Phân loại Tài khoản</Title>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleChartData.filter(d => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {roleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* --- Hàng Biểu đồ (Bar) --- */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card bordered={false} className="chart-container">
              <Title level={5}><BarChartOutlined /> Trạng thái Lịch hẹn (Tổng: {stats.totalAppointments})</Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
                  <Legend />
                  <Bar dataKey="count" fill="var(--ant-primary-color)" name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default AdminDashboard;