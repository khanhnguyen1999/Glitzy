import { create } from "zustand";
import { Activity } from "@/types";
import { activityService } from "@/services/activityService";

interface ActivityState {
  activities: Activity[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markActivityAsRead: (activityId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const activities = await activityService.getActivities();
      set({ activities, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch activities" 
      });
    }
  },
  
  fetchUnreadCount: async () => {
    try {
      const { count } = await activityService.getUnreadActivitiesCount();
      set({ unreadCount: count });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch unread count" 
      });
    }
  },
  
  markActivityAsRead: async (activityId: string) => {
    try {
      const updatedActivity = await activityService.markActivityAsRead(activityId);
      set(state => ({ 
        activities: state.activities.map(a => a.id === activityId ? { ...a, read: true } : a),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to mark activity as read" 
      });
    }
  },
  
  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      await activityService.markAllActivitiesAsRead();
      set(state => ({ 
        activities: state.activities.map(a => ({ ...a, read: true })),
        unreadCount: 0,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to mark all as read" 
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));