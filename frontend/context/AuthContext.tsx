import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';


type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, user, isLoadingUser } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    checkAuthStatus();
  }, []);

  // Update authentication state when user data changes
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    }
  }, [user]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // Fetch user profile if token exists
        await profile();
        // Authentication state will be updated by the user effect above
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await AsyncStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: isLoading || isLoadingUser,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
