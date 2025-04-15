import apiClient from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  token: string;
  refreshToken: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<string>('/v1/authenticate', credentials);
    
    // Store tokens
    await AsyncStorage.setItem('auth_token', response.data);
    // await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
    
    return response.data;
  },
  
  register: async (data: RegisterData) => {
    const response = await apiClient.post<AuthResponse>('/v1/register', data);
    
    // Store tokens if registration automatically logs in the user
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
    
    return response.data;
  },
  
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API success
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      window.location.reload()
    }
  },

  profile: async () => {
    try {
      const response = await apiClient.get('/v1/profile');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
};