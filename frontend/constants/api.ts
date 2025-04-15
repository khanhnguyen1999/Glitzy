// API base URL - adjust based on environment
export const API_URL = 'http://localhost:3001';

// API endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  
  // User
  USER: '/v1/user',
  USER_PROFILE: '/v1/user/profile',
  
  // Friends
  FRIENDS: '/v1/friends',
  
  // Groups
  GROUPS: '/v1/groups',
  
  // Expenses
  EXPENSES: '/v1/expense',
  
  // Messages
  MESSAGES: '/v1/messages',
};
