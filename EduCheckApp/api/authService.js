import axios from 'axios';

const API_BASE_URL = 'http://your-backend-api-url'; // 替换为您的后端API URL

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const loginUserApi = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    const { token, user } = response.data;
    // Save token to local storage or state management
    localStorage.setItem('jwtToken', token);
    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserApi = async (userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/update-profile`, userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const handleApiError = (error) => {
  if (error.response) {
    // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
    return error.response.data.message || 'An error occurred on the server.';
  } else if (error.request) {
    // 请求已经成功发起，但没有收到响应
    return 'No response from the server. Please check your network connection.';
  } else {
    // 发送请求时出了点问题
    return error.message || 'An unexpected error occurred.';
  }
};
