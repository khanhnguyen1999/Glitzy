import { create } from "zustand";
import { Friend, User } from "@/types";
import { friendService } from "@/services/friendService";

interface FriendState {
  friends: Friend[];
  friendRequests: Friend[];
  rejectedRequests: Friend[];
  searchResults: User[];
  isLoading: boolean;
  error: string | null;
  fetchFriends: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  fetchAllFriendsWithStatus: () => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  addFriend: (userId: string) => Promise<Friend>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  searchNonFriends: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  friendRequests: [],
  rejectedRequests: [],
  searchResults: [],
  isLoading: false,
  error: null,
  
  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const friends = await friendService.getFriends();
      set({ friends: friends.data.data.filter((f: Friend) => f.status === 'accepted'), isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch friends" 
      });
    }
  },
  
  fetchFriendRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendService.getFriendRequests();
      set({ friendRequests: response.data.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch friend requests" 
      });
    }
  },
  
  fetchAllFriendsWithStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendService.getAllFriendsWithStatus();
      set({ 
        friends: response.data.data.accepted, 
        friendRequests: response.data.data.pending,
        rejectedRequests: response.data.data.rejected,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch friends with status" 
      });
    }
  },
  
  acceptFriendRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      await friendService.acceptFriendRequest(requestId);
      // Update the friend requests list and refresh friends list
      await get().fetchFriendRequests();
      await get().fetchFriends();
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to accept friend request" 
      });
    }
  },
  
  rejectFriendRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      await friendService.rejectFriendRequest(requestId);
      // Update the friend requests list
      await get().fetchFriendRequests();
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to reject friend request" 
      });
    }
  },
  
  addFriend: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendService.addFriend(userId);
      // Don't add to friends list yet - it's just a request until accepted
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to send friend request" 
      });
      throw error;
    }
  },
  
  removeFriend: async (friendId: string) => {
    set({ isLoading: true, error: null });
    try {
      await friendService.removeFriend(friendId);
      set(state => ({ 
        friends: state.friends.filter(f => f.id !== friendId),
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to remove friend" 
      });
    }
  },
  
  searchUsers: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      if (query.trim() === "") {
        set({ searchResults: [], isLoading: false });
        return;
      }
      
      const response = await friendService.searchUsers(query);
      set({ searchResults: response.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to search users" 
      });
    }
  },
  
  searchNonFriends: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      if (query.trim() === "") {
        set({ searchResults: [], isLoading: false });
        return;
      }
      
      const response = await friendService.searchNonFriends(query);
      set({ searchResults: response.data.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to search users" 
      });
    }
  },
  
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
  
  clearError: () => {
    set({ error: null });
  },
}));