// src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd'; // <-- Import Layout của antd
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

const MainLayout = () => {
  return (
    // Layout của antd sẽ tự động chia
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar /> {/* Sider (Menu) sẽ nằm ở đây */}
      <Layout>
        <Header /> {/* Header (Thanh trên) */}
        
        {/* Phần nội dung chính */}
        <Content 
          style={{ 
            margin: '24px 16px', 
            padding: 24, 
            background: '#fff', 
            borderRadius: '8px' 
          }}
        >
          <Outlet /> {/* Các Screen sẽ render ở đây */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;