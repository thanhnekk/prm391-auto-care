// src/screens/admin/UserManagementScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import Pagination from '../../components/common/Pagination';
import UserEditModal from '../../components/admin/UserEditModal';
import { useAuth } from '../../context/AuthProvider'; // Để lấy ID admin
import './AdminCRUD.css'; // Tái sử dụng CSS

const UserManagementScreen = () => {
  const { auth } = useAuth(); // Lấy user hiện tại
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State cho Phân trang và Lọc
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
  });

  // Hàm tải dữ liệu
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...filters,
      };
      // Lọc bỏ các giá trị rỗng
      Object.keys(params).forEach(key => 
        (params[key] === '' || params[key] === null) && delete params[key]
      );

      const response = await userService.adminGetAllUsers(params);
      
      setUsers(response.data.users);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalUsers: response.data.totalUsers,
      });

    } catch (err) {
      setError('Lỗi tải dữ liệu người dùng: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]); // Chạy lại khi trang hoặc bộ lọc thay đổi

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý khi bấm nút "Lọc"
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Quay về trang 1
    loadUsers(); // `loadUsers` sẽ tự động chạy vì `filters` thay đổi
  };

  // Mở modal
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Xử lý "Lưu" từ Modal
  const handleSave = async (id, data) => {
    try {
      await userService.adminUpdateUser(id, data);
      setIsModalOpen(false);
      loadUsers(); // Tải lại
    } catch (err) {
      console.error(err);
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xử lý "Xóa mềm"
  const handleDelete = async (user) => {
    if (user._id === auth.user.id) {
      alert("Bạn không thể tự xóa chính mình.");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa (ẩn) người dùng ${user.email}?`)) {
      try {
        await userService.adminDeleteUser(user._id);
        loadUsers(); // Tải lại
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="admin-crud-screen">
      <div className="screen-header">
        <h1>Quản lý Người dùng ({pagination.totalUsers})</h1>
        {/* Nút tạo mới có thể thêm ở đây nếu Admin được tạo user */}
      </div>

      {/* --- BỘ LỌC --- */}
      <form onSubmit={handleFilterSubmit} className="filter-form">
        <input 
          type="text"
          name="search"
          placeholder="Tìm theo email/tên..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">Tất cả Vai trò</option>
          <option value="user">User</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Tất cả Trạng thái</option>
          <option value="active">Active</option>
          <option value="locked">Locked</option>
          <option value="deleted">Deleted</option>
        </select>
        <button type="submit">Lọc</button>
      </form>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Vai trò (Role)</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(user)} className="btn-edit">
                      Sửa
                    </button>
                    {user.status !== 'deleted' && user._id !== auth.user.id && (
                      <button onClick={() => handleDelete(user)} className="btn-delete">
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal Form */}
      <UserEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagementScreen;