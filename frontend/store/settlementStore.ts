import { create } from "zustand";
import { Settlement } from "@/types";
import { settlementService } from "@/services/settlementService";

interface SettlementState {
  settlements: Settlement[];
  isLoading: boolean;
  error: string | null;
  fetchSettlements: () => Promise<void>;
  createSettlement: (settlementData: Partial<Settlement>) => Promise<Settlement>;
  updateSettlementStatus: (settlementId: string, status: "pending" | "completed") => Promise<Settlement>;
  fetchUserSettlements: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useSettlementStore = create<SettlementState>((set, get) => ({
  settlements: [],
  isLoading: false,
  error: null,
  
  fetchSettlements: async () => {
    set({ isLoading: true, error: null });
    try {
      const settlements = await settlementService.getSettlements();
      set({ settlements, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch settlements" 
      });
    }
  },
  
  createSettlement: async (settlementData: Partial<Settlement>) => {
    set({ isLoading: true, error: null });
    try {
      const newSettlement = await settlementService.createSettlement(settlementData);
      set(state => ({ 
        settlements: [...state.settlements, newSettlement], 
        isLoading: false 
      }));
      return newSettlement;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to create settlement" 
      });
      throw error;
    }
  },
  
  updateSettlementStatus: async (settlementId: string, status: "pending" | "completed") => {
    set({ isLoading: true, error: null });
    try {
      const updatedSettlement = await settlementService.updateSettlementStatus(settlementId, status);
      set(state => ({ 
        settlements: state.settlements.map(s => s.id === settlementId ? updatedSettlement : s),
        isLoading: false 
      }));
      return updatedSettlement;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to update settlement status" 
      });
      throw error;
    }
  },
  
  fetchUserSettlements: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const settlements = await settlementService.getUserSettlements(userId);
      set({ settlements, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch user settlements" 
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));