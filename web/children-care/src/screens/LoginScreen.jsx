// src/screens/LoginScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { authService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Gọi service để login (backend trả về payload bạn đã đưa)
      const data = await authService.login(email, password);
      
      const accessToken = data.accessToken;
      if (!accessToken) {
        throw new Error("Không nhận được access token");
      }

      // 2. Decode token để lấy thông tin user (role)
      const decodedUser = jwtDecode(accessToken);

      // --- LOGIC KIỂM TRA QUYỀN TẠI ĐÂY ---
      if (decodedUser.role !== 'admin' && decodedUser.role !== 'doctor') {
        setError('Tài khoản không có quyền truy cập. Chỉ Admin hoặc Bác sĩ mới được đăng nhập.');
        return; // Dừng lại, không cho 'user' đăng nhập
      }
      console.log(decodedUser)
      // 3. Cập nhật Context 
      setAuth({ accessToken: accessToken, user: decodedUser });

      // 4. Lưu token vào localStorage
      localStorage.setItem("accessToken", accessToken);

      // 5. Chuyển hướng đến trang Dashboard
      navigate('/'); 

    } catch (err) {
      console.error(err);
      setError(err.message || 'Email hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div>
      <h2>Đăng nhập (Admin / Doctor)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default LoginScreen;