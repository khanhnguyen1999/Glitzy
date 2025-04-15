import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/axiosConfig';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state by checking for token and user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          const user = JSON.parse(userData);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await api.post('/v1/auth/login', { email, password });
      const { token, user } = response.data;

      // Store token and user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Update auth state
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem('auth_token');

      // Reset auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Register function
  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await api.post('/v1/auth/register', userData);
      const { token, user } = response.data;

      // Store token and user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Update auth state
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await api.put('/v1/users/profile', updates, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      });

      const updatedUser = response.data;

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    register,
    updateProfile,
  };
}
