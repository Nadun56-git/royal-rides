/**
 * Royal Rides — API Client (Axios)
 * Configures base URL, request credentials, and auth header injection.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // Send httpOnly cookies (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rr_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh or global error handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          '/api/v1/auth/refresh-token',
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('rr_access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('rr_access_token');
        localStorage.removeItem('rr_user');
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
