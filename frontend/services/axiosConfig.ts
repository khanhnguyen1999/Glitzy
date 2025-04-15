import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3001', // Replace with your API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config: any) => {
    // Get token from storage
    const token = await AsyncStorage.getItem('auth_token');
    
    // If token exists, add to headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    console.log('error ',error)
    const originalRequest: any = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post(
            'https://api.example.com/auth/refresh',
            { refreshToken }
          );
          
          const { token } = response.data;
          
          // Save new token
          await AsyncStorage.setItem('auth_token', token);
          
          // Update header and retry
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        // You would typically navigate to login screen here
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;