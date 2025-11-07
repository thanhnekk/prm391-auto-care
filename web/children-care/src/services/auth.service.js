// src/services/auth.service.js
import baseAxios from '../api/axios';

const login = async (email, password) => {
  try {
    const response = await baseAxios.post('/auth/login', {
      email,
      password,
    });
    return response.data; 
  } catch (error) {
    throw error.response?.data || error; 
  }
};

const logout = async () => {
  try {
    const response = await baseAxios.post('/auth/logout'); 
    return response.data;
  } catch (error) {
    console.error("API Logout error", error);
    throw error.response?.data || error;
  }
};


export const authService = {
  login,
  logout, 
};