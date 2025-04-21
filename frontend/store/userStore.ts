import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, ENDPOINTS } from '../constants/api';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  profilePicture?: string;
  token: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}${ENDPOINTS.LOGIN}`, {
            email,
            password
          });
          
          const { token, user } = response.data;
          
          // Set token for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Store token in localStorage for persistence
          localStorage.setItem('token', token);
          
          set({
            user: { ...user, token },
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) { 
          console.error('Login error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed. Please check your credentials.'
          });
        }
      },

      register: async (username: string, email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}${ENDPOINTS.REGISTER}`, {
            username,
            email,
            password,
            name
          });
          
          const { token, user } = response.data;
          
          // Set token for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Store token in localStorage for persistence
          localStorage.setItem('token', token);
          
          set({
            user: { ...user, token },
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Registration error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed. Please try again.'
          });
        }
      },

      logout: () => {
        // Remove token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          isAuthenticated: false
        });
      },

      updateProfile: async (profileData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(
            `${API_URL}${ENDPOINTS.USER_PROFILE}`,
            profileData,
            {
              headers: {
                Authorization: `Bearer ${get().user?.token}`
              }
            }
          );
          
          set({
            user: { ...get().user, ...response.data },
            isLoading: false
          });
        } catch (error: any) {
          console.error('Profile update error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Profile update failed. Please try again.'
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
