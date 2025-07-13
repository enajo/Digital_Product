// src/services/api.js
import axios from "axios";

// Use a relative base so Vite can proxy /api → backend
const baseURL = "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // clear any stored token
      localStorage.removeItem("token");
      // redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
