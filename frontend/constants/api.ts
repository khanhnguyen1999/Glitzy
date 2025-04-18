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
  FRIEND_REQUESTS: '/v1/friends/status/pending',
  
  // Groups
  GROUPS: '/v1/groups',
  GROUP_MEMBERS: '/v1/groups/:groupId/members',
  GROUP_INVITATIONS: '/v1/groups/invitations',
  
  // Expenses
  EXPENSES: '/v1/expense',
  GROUP_EXPENSES: '/v1/expense/group/:groupId',
  EXPENSE_SUMMARY: '/v1/expense/summary/:groupId',
  MARK_EXPENSE_PAID: '/v1/expense/:expenseId/mark-paid/:userId',
  
  // Messages
  MESSAGES: '/v1/messages',
  GROUP_MESSAGES: '/v1/messages/group/:groupId',
  
  // Travel Recommendations
  LOCATIONS: '/v1/travel-recommendations/locations/:destination',
  ITINERARY: '/v1/travel-recommendations/itinerary',
  TRIP_ITINERARY: '/v1/travel-recommendations/itinerary/:tripId',
};
