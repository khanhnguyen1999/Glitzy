import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:3001", // This would be your real API in production
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh if 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        
        // Call refresh token endpoint
        const response = await axios.post(
          "https://api.example.com/auth/refresh",
          { refreshToken }
        );
        
        const { token } = response.data;
        await AsyncStorage.setItem("auth_token", token);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        await AsyncStorage.removeItem("auth_token");
        await AsyncStorage.removeItem("refresh_token");
        // In a real app, you would redirect to login here
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;