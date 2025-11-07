// src/components/dashboard/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Spin, message, List, Tag, Button, Typography } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthProvider';
import { appointmentService } from '../../services/appointmentService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const { Title } = Typography;

// [Hàm helper xử lý dữ liệu]
const processDoctorData = (appointments) => {
  const stats = {
    total: appointments.length,
    confirmed: 0,
    done: 0,
    pending: 0,
  };
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = [];

  appointments.forEach(appt => {
    // 1. Đếm trạng thái
    if (stats[appt.status] !== undefined) {
      stats[appt.status]++;
    }
    
    // 2. Lọc lịch hẹn hôm nay
    const apptDate = new Date(appt.scheduledAt);
    apptDate.setHours(apptDate.getHours() + 7);
    const apptDateStr = apptDate.toISOString().split('T')[0];

    if (apptDateStr === todayStr && (appt.status === 'confirmed' || appt.status === 'done')) {
      todayAppointments.push(appt);
    }

  });

  const chartData = [
    { name: 'Chờ (Pending)', value: stats.pending },
    { name: 'Sắp tới (Confirmed)', value: stats.confirmed },
    { name: 'Hoàn thành (Done)', value: stats.done },
  ];
  
  // Sắp xếp lịch hôm nay theo giờ
  todayAppointments.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return { stats, chartData, todayAppointments };
};


const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        setLoading(true);
        const appointmentsRes = await appointmentService.getDoctorAppointments();
        
        const { stats, chartData, todayAppointments } = processDoctorData(appointmentsRes.data);
        
        setStats(stats);
        setChartData(chartData);
        setTodayAppointments(todayAppointments);

      } catch (error) {
        console.error("Lỗi lấy thống kê Bác sĩ:", error);
        message.error('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorStats();
  }, [auth.user.id]);

  const COLORS = ['#FFBB28', '#00C49F', '#0088FE'];

  return (
    <Spin spinning={loading}>
      <div className="doctor-dashboard">
        <Title level={3}>Hoạt động của bạn</Title>
        
        {/* --- Dàn Statistic Cards --- */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false}>
              <Statistic
                title="Lịch hẹn Hôm nay"
                value={todayAppointments.length}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false}>
              <Statistic
                title="Lịch hẹn Sắp tới"
                value={stats?.confirmed}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false}>
              <Statistic
                title="Chờ Kê đơn/Đã kê đơn"
                value={stats?.done}
                prefix={<EditOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* --- Biểu đồ và Danh sách --- */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        
          {/* Danh sách lịch hẹn hôm nay */}
          <Col xs={24} lg={10}>
            <Card 
              title="Lịch hẹn Hôm nay" 
              bordered={false} 
              style={{height: '100%'}}
              extra={<Button onClick={() => navigate('/doctor/schedule')}>Xem tất cả</Button>}
            >
              <List
                className="today-appointments-list"
                itemLayout="horizontal"
                dataSource={todayAppointments}
                renderItem={(appt) => (
                  <List.Item
                    actions={[
                      <Tag color={appt.status === 'done' ? 'default' : 'blue'}>
                        {appt.status === 'done' ? 'Đã xong' : 'Sắp tới'}
                      </Tag>
                    ]}
                  >
                    <List.Item.Meta
                      title={appt.userId?.username}
                      description={`${new Date(appt.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - Dịch vụ: ${appt.serviceTypeIds?.name}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Biểu đồ tròn */}
          <Col xs={24} lg={14}>
            <Card title="Tỷ lệ Lịch hẹn" bordered={false} style={{height: '100%'}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
        </Row>
      </div>
    </Spin>
  );
};

export default DoctorDashboard;