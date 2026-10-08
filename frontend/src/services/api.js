import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5078/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لإرفاق رمز JWT تلقائياً مع كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;