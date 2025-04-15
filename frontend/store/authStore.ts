import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginCredentials, RegisterData } from '@/services/authService';

export const useAuthStore = () => {
  const queryClient = useQueryClient();
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Update user data in the cache
      // queryClient.setQueryData(['user'], data.user);
      window.location.reload();
    },
  });

  // Profile mutation
  const userProfileMutation = useMutation({
    mutationFn: () => authService.profile(),
    onSuccess: (data) => {
      // Update user data in the cache
      queryClient.setQueryData(['user'], data.data);
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      // Update user data in the cache
      queryClient.setQueryData(['user'], data.user);
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear user data from cache
      queryClient.clear();
    },
  });
  
  // Get current user query
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: authService.profile,
    // Don't fetch user on mount, only when explicitly enabled
    enabled: false,
    retry: false,
  });
  
  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    profile: userProfileMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    user: userQuery.data,
    isLoadingUser: userQuery.isLoading,
    refetchUser: userQuery.refetch,
  };
};