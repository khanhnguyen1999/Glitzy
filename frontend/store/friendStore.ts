import { create } from "zustand";
import { Friend, User } from "@/types";
import { friendService } from "@/services/friendService";

interface FriendState {
  friends: Friend[];
  searchResults: User[];
  isLoading: boolean;
  error: string | null;
  fetchFriends: () => Promise<void>;
  addFriend: (userId: string) => Promise<Friend>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  searchResults: [],
  isLoading: false,
  error: null,
  
  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const friends = await friendService.getFriends();
      set({ friends: friends.data.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch friends" 
      });
    }
  },
  
  addFriend: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const newFriend = await friendService.addFriend(userId);
      set(state => ({ 
        friends: [...state.friends, newFriend], 
        isLoading: false 
      }));
      return newFriend;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to add friend" 
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
      
      const users = await friendService.searchUsers(query);
      set({ searchResults: users, isLoading: false });
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