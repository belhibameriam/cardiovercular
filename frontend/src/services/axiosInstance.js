// src/api/axiosInstance.js

import axios from "axios";

// Get the API base URL from the environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Create an instance of axios
const axiosInstance = axios.create({
  baseURL: baseURL, // Use the baseURL from the .env file
  timeout: 10000, // Set a timeout for requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to log the user out
const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login"; // Redirect to the login page or another route
};

// Helper function to refresh the token
const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${baseURL}/api/token/refresh/`, {
      refresh: refresh,
    });
    const { access } = response.data;
    localStorage.setItem("access", access); // Store the new access token
    return access;
  } catch (error) {
    console.error("Unable to refresh token", error);
    logout(); // Log the user out if the refresh token is invalid or expired
    throw error;
  }
};

// Add a request interceptor to attach tokens or log requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle responses and errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors due to expired access token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshToken(); // Attempt to refresh the token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Set new token to header
        return axiosInstance(originalRequest); // Retry the original request with the new token
      } catch (refreshError) {
        // If refreshing fails, log the user out
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
