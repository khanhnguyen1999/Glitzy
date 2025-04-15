import api from "./api";
import { Activity } from "@/types";
import { mockActivities } from "@/mocks/activities";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const activityService = {
  getActivities: async () => {
    // Simulate API call
    await delay(800);
    
    return mockActivities;
  },
  
  getUnreadActivitiesCount: async () => {
    // Simulate API call
    await delay(500);
    
    const unreadCount = mockActivities.filter(a => !a.read).length;
    
    return { count: unreadCount };
  },
  
  markActivityAsRead: async (activityId: string) => {
    // Simulate API call
    await delay(600);
    
    const activity = mockActivities.find(a => a.id === activityId);
    
    if (!activity) {
      throw new Error("Activity not found");
    }
    
    // Mark activity as read
    const updatedActivity = {
      ...activity,
      read: true,
    };
    
    return updatedActivity;
  },
  
  markAllActivitiesAsRead: async () => {
    // Simulate API call
    await delay(800);
    
    return { success: true };
  },
};