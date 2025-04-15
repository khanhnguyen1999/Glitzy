import api from "./api";
import { Settlement } from "@/types";
import { mockSettlements } from "@/mocks/settlements";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const settlementService = {
  getSettlements: async () => {
    // Simulate API call
    await delay(800);
    
    return mockSettlements;
  },
  
  getSettlementById: async (settlementId: string) => {
    // Simulate API call
    await delay(500);
    
    const settlement = mockSettlements.find(s => s.id === settlementId);
    
    if (!settlement) {
      throw new Error("Settlement not found");
    }
    
    return settlement;
  },
  
  createSettlement: async (settlementData: Partial<Settlement>) => {
    // Simulate API call
    await delay(1000);
    
    // Create new settlement with mock data
    const newSettlement: Settlement = {
      id: `settlement${mockSettlements.length + 1}`,
      fromUserId: settlementData.fromUserId || "",
      toUserId: settlementData.toUserId || "",
      amount: settlementData.amount || 0,
      currency: settlementData.currency || "USD",
      date: settlementData.date || new Date().toISOString(),
      status: settlementData.status || "pending",
      method: settlementData.method || "cash",
      notes: settlementData.notes,
    };
    
    return newSettlement;
  },
  
  updateSettlementStatus: async (settlementId: string, status: "pending" | "completed") => {
    // Simulate API call
    await delay(800);
    
    const settlement = mockSettlements.find(s => s.id === settlementId);
    
    if (!settlement) {
      throw new Error("Settlement not found");
    }
    
    // Update settlement status
    const updatedSettlement = {
      ...settlement,
      status,
    };
    
    return updatedSettlement;
  },
  
  getUserSettlements: async (userId: string) => {
    // Simulate API call
    await delay(700);
    
    // Filter settlements where user is involved
    const settlements = mockSettlements.filter(
      s => s.fromUserId === userId || s.toUserId === userId
    );
    
    return settlements;
  },
};