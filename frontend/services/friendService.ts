import api from "./api";
import { Friend, User } from "@/types";
import { mockFriends } from "@/mocks/friends";
import { mockUsers } from "@/mocks/users";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const friendService = {
  getFriends: async () => {
    const response = await api.get('/v1/friends');
    return response.data;
  },
  
  getFriendRequests: async () => {
    // Get pending friend requests
    const response = await api.get('/v1/friends/status/pending');
    return response.data;
  },
  
  getAllFriendsWithStatus: async () => {
    // Get all friends with their statuses (pending, accepted, rejected)
    const response = await api.get('/v1/friends/all-with-status');
    return response.data;
  },
  
  acceptFriendRequest: async (requestId: string) => {
    const response = await api.post(`/v1/friends/accept/${requestId}`);
    return response.data;
  },
  
  rejectFriendRequest: async (requestId: string) => {
    const response = await api.post(`/v1/friends/reject/${requestId}`);
    return response.data;
  },
  
  getFriendById: async (friendId: string) => {
    // Simulate API call
    await delay(500);
    
    const friend = mockFriends.find(f => f.id === friendId);
    
    if (!friend) {
      throw new Error("Friend not found");
    }
    
    return friend;
  },
  
  addFriend: async (userId: string) => {
    // Send friend request to the API
    const response = await api.post('/v1/friends/request', { friendId: userId });
    return response.data;
  },
  
  removeFriend: async (friendId: string) => {
    // Simulate API call
    await delay(800);
    
    return { success: true };
  },
  
  getFriendBalance: async (friendId: string) => {
    // Simulate API call
    await delay(600);
    
    const friend = mockFriends.find(f => f.id === friendId);
    
    if (!friend) {
      throw new Error("Friend not found");
    }
    
    return { balance: friend.balance };
  },
  
  searchFriends: async (query: string) => {
    const response = await api.get(`/v1/friends/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
  },
  
  searchNonFriends: async (query: string) => {
    // This endpoint specifically searches for users who are not already friends
    const response = await api.get(`/v1/friends/users/search/non-friends?query=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  searchUsers: async (query: string) => {
    const response = await api.get(`/v1/users?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};