import api from "./api";
import { Group, User, Expense } from "@/types";

export interface LocationSearchResult {
  place_id: string;
  osm_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    country?: string;
    state?: string;
  };
  type?: string;
  importance?: number;
}
import { mockGroups } from "@/mocks/groups";
import { mockExpenses } from "@/mocks/expenses";
import { mockUsers } from "@/mocks/users";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const groupService = {
  getGroups: async (userId: string) => {
    const response = await api.get(`/v1/groups/user/${userId}`);
    return response.data;
  },

  getGroupById: async (groupId: string) => {
    const response = await api.get(`/v1/groups/${groupId}`);
    return response.data;
  },

  createGroup: async (groupData: Partial<Group>) => {
    // Format the data for the backend API
    const payload = {
      name: groupData.name,
      description: groupData.description,
      image: groupData.image || groupData.coverImage, // Support both image and coverImage
      memberIds: groupData.memberIds,
      location: groupData.location,
      category: groupData.category
    };

    const response = await api.post('/v1/groups', payload);
    return response.data;
  },

  updateGroup: async (groupId: string, groupData: Partial<Group>) => {
    // Simulate API call
    await delay(800);

    const group = mockGroups.find(g => g.id === groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    // Update group with new data
    const updatedGroup = {
      ...group,
      ...groupData,
      updatedAt: new Date().toISOString(),
    };

    return updatedGroup;
  },

  deleteGroup: async (groupId: string) => {
    // Simulate API call
    await delay(800);

    return { success: true };
  },

  addMemberToGroup: async (groupId: string, userId: string) => {
    // Simulate API call
    await delay(600);

    const group = mockGroups.find(g => g.id === groupId);
    const user = mockUsers.find(u => u.id === userId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is already a member
    if (group.members.some(m => m.id === userId)) {
      throw new Error("User is already a member of this group");
    }

    // Add user to group
    const updatedGroup = {
      ...group,
      members: [...group.members, user],
      updatedAt: new Date().toISOString(),
    };

    return updatedGroup;
  },

  removeMemberFromGroup: async (groupId: string, userId: string) => {
    // Simulate API call
    await delay(600);

    const group = mockGroups.find(g => g.id === groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    // Remove user from group
    const updatedGroup = {
      ...group,
      members: group.members.filter(m => m.id !== userId),
      updatedAt: new Date().toISOString(),
    };

    return updatedGroup;
  },

  getGroupExpenses: async (groupId: string) => {
    // Simulate API call
    await delay(700);

    // Filter expenses by group ID
    const expenses = mockExpenses.filter(e => e.groupId === groupId);

    return expenses;
  },

  getGroupBalances: async (groupId: string) => {
    // Simulate API call
    await delay(800);

    const group = mockGroups.find(g => g.id === groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    // Calculate balances between members
    const balances = group.members.map(member => {
      // In a real app, this would calculate the actual balance
      // based on expenses and settlements
      const randomBalance = Math.round((Math.random() * 200 - 100) * 100) / 100;

      return {
        userId: member.id,
        userName: member.name,
        balance: randomBalance,
      };
    });

    return balances;
  },

  generateRecommendations: async (location: string, tripType: string) => {
    try {
      const response = await api.post('/v1/groups/recommendations', {
        location,
        tripType
      });
      return response.data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  },
  
  searchLocations: async (query: string, limit: number = 5): Promise<LocationSearchResult[]> => {
    try {
      const response = await api.get(`/v1/groups/locations/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  },
};