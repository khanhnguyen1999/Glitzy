import { create } from "zustand";
import { Expense, ExpenseDTO } from "@/types";
import { expenseService } from "@/services/expenseService";

interface ExpenseState {
  expenses: Expense[];
  currentExpense: Expense | null;
  balances: any[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: (userId: string) => Promise<void>;
  fetchExpenseById: (expenseId: string) => Promise<void>;
  createExpense: (expenseData: ExpenseDTO) => Promise<Expense>;
  updateExpense: (expenseId: string, expenseData: Partial<ExpenseDTO>) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  fetchUserExpenses: (userId: string, page?: number, limit?: number) => Promise<void>;
  fetchGroupExpenses: (groupId: string, page?: number, limit?: number) => Promise<void>;
  fetchGroupBalances: (groupId: string) => Promise<void>;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  currentExpense: null,
  balances: [],
  isLoading: false,
  error: null,
  
  fetchExpenses: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await expenseService.getExpenses(userId);
      set({ expenses: expenses.data.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch expenses" 
      });
    }
  },
  
  fetchExpenseById: async (expenseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await expenseService.getExpenseById(expenseId);
      set({ currentExpense: expense.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch expense" 
      });
    }
  },
  
  createExpense: async (expenseData: ExpenseDTO) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await expenseService.createExpense(expenseData);
      set(state => ({ 
        expenses: [...state.expenses, newExpense], 
        isLoading: false 
      }));
      return newExpense;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to create expense" 
      });
      throw error;
    }
  },
  
  updateExpense: async (expenseId: string, expenseData: Partial<ExpenseDTO>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedExpense = await expenseService.updateExpense(expenseId, expenseData);
      set(state => ({ 
        expenses: state.expenses.map(e => e.id === expenseId ? updatedExpense : e),
        currentExpense: state.currentExpense?.id === expenseId ? updatedExpense : state.currentExpense,
        isLoading: false 
      }));
      return updatedExpense;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to update expense" 
      });
      throw error;
    }
  },
  
  deleteExpense: async (expenseId: string) => {
    set({ isLoading: true, error: null });
    try {
      await expenseService.deleteExpense(expenseId);
      set(state => ({ 
        expenses: state.expenses.filter(e => e.id !== expenseId),
        currentExpense: state.currentExpense?.id === expenseId ? null : state.currentExpense,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to delete expense" 
      });
    }
  },
  
  fetchUserExpenses: async (userId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expenseService.getUserExpenses(userId, page, limit);
      set({ expenses: response.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch user expenses" 
      });
    }
  },
  
  fetchGroupExpenses: async (groupId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expenseService.getGroupExpenses(groupId, page, limit);
      set({ expenses: response.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch group expenses" 
      });
    }
  },
  
  fetchGroupBalances: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const balances = await expenseService.getGroupBalances(groupId);
      set({ balances, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch group balances" 
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));