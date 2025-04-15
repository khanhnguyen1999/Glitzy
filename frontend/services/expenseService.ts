import api from "./api";
import { Expense, ExpenseDTO } from "@/types";

export const expenseService = {
  getExpenses: async (userId: string) => {
    try {
      const response = await api.get(`/v1/expense/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },
  
  getExpenseById: async (expenseId: string) => {
    try {
      const response = await api.get(`/v1/expense/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching expense ${expenseId}:`, error);
      throw error;
    }
  },
  
  createExpense: async (expenseData: ExpenseDTO) => {
    try {
      const response = await api.post('/v1/expense', expenseData);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },
  
  updateExpense: async (expenseId: string, expenseData: Partial<ExpenseDTO>) => {
    try {
      const response = await api.put(`/expenses/${expenseId}`, expenseData);
      return response.data;
    } catch (error) {
      console.error(`Error updating expense ${expenseId}:`, error);
      throw error;
    }
  },
  
  deleteExpense: async (expenseId: string) => {
    try {
      const response = await api.delete(`/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting expense ${expenseId}:`, error);
      throw error;
    }
  },
  
  getUserExpenses: async (userId: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/v1/expenses/user/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching expenses for user ${userId}:`, error);
      throw error;
    }
  },
  
  getGroupExpenses: async (groupId: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/v1/expenses/group/${groupId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching expenses for group ${groupId}:`, error);
      throw error;
    }
  },
  
  getGroupBalances: async (groupId: string) => {
    try {
      const response = await api.get(`/v1/expenses/group/${groupId}/balances`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching balances for group ${groupId}:`, error);
      throw error;
    }
  }
};