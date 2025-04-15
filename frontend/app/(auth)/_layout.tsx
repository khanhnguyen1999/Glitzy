import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '@/constants/colors';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect authenticated users to the main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Allow unauthenticated users to access auth screens
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
