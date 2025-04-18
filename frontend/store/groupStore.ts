import { create } from "zustand";
import { Group } from "@/types";
import { groupService } from "@/services/groupService";

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  fetchGroups: (userId: string) => Promise<void>;
  fetchGroupById: (groupId: string) => Promise<Group>;
  createGroup: (groupData: Partial<Group>) => Promise<Group>;
  updateGroup: (groupId: string, groupData: Partial<Group>) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, userId: string) => Promise<Group>;
  removeMemberFromGroup: (groupId: string, userId: string) => Promise<Group>;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null,
  
  fetchGroups: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const groups = await groupService.getGroups(userId);
      set({ groups, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch groups" 
      });
    }
  },
  
  fetchGroupById: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const group = await groupService.getGroupById(groupId);
      set({ currentGroup: group, isLoading: false });
      return group;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch group" 
      });
      throw error;
    }
  },
  
  createGroup: async (groupData: Partial<Group>) => {
    set({ isLoading: true, error: null });
    try {
      const newGroup = await groupService.createGroup(groupData);
      set(state => ({ 
        groups: [...state.groups, newGroup], 
        isLoading: false 
      }));
      return newGroup;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to create group" 
      });
      throw error;
    }
  },
  
  updateGroup: async (groupId: string, groupData: Partial<Group>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGroup = await groupService.updateGroup(groupId, groupData);
      set(state => ({ 
        groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
        currentGroup: state.currentGroup?.id === groupId ? updatedGroup : state.currentGroup,
        isLoading: false 
      }));
      return updatedGroup;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to update group" 
      });
      throw error;
    }
  },
  
  deleteGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.deleteGroup(groupId);
      set(state => ({ 
        groups: state.groups.filter(g => g.id !== groupId),
        currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to delete group" 
      });
    }
  },
  
  addMemberToGroup: async (groupId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGroup = await groupService.addMemberToGroup(groupId, userId);
      set(state => ({ 
        groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
        currentGroup: state.currentGroup?.id === groupId ? updatedGroup : state.currentGroup,
        isLoading: false 
      }));
      return updatedGroup;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to add member to group" 
      });
      throw error;
    }
  },
  
  removeMemberFromGroup: async (groupId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGroup = await groupService.removeMemberFromGroup(groupId, userId);
      set(state => ({ 
        groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
        currentGroup: state.currentGroup?.id === groupId ? updatedGroup : state.currentGroup,
        isLoading: false 
      }));
      return updatedGroup;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to remove member from group" 
      });
      throw error;
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));