import { IExpenseRepository } from '@modules/expense/interface';
import { Balance, Expense, ExpenseDTO } from '@modules/expense/model';
import {
  ErrExpenseNotFound,
  ErrGroupNotFound,
  ErrInvalidExpenseData,
  ErrPaidByNotInSplit,
  ErrSplitAmountMismatch,
  ErrUnauthorizedExpenseAccess,
  ErrUserNotFound,
  ErrUserNotInGroup
} from '@modules/expense/model/error';
import { IUseCase } from '@shared/interface';
import { Paginated, PagingDTO, Requester } from '@shared/model';

export class ExpenseUseCase implements IUseCase<ExpenseDTO, Partial<ExpenseDTO>, Expense, any> {
  constructor(private repository: IExpenseRepository) {}

  // Create a new expense
  async createExpense(requester: Requester, expenseData: ExpenseDTO): Promise<Expense> {
    // Validate expense data
    this.validateExpenseData(expenseData);

    // Check if the requester is the one paying or is authorized to create on behalf of the payer
    if (requester.sub !== expenseData.paidById) {
      // In a real app, you might want to check if the requester has admin permissions
      // For now, we'll only allow users to create expenses they paid for
      throw ErrUnauthorizedExpenseAccess;
    }

    // If this is a group expense, check if all users in the split are part of the group
    if (expenseData.groupId) {
      // This would require additional logic to check group membership
      // For now, we'll assume the check is done elsewhere
    }

    // Create the expense
    return this.repository.create(expenseData);
  }

  // Get a specific expense by ID
  async getExpense(requester: Requester, expenseId: string): Promise<Expense> {
    const expense = await this.repository.findById(expenseId);
    if (!expense) {
      throw ErrExpenseNotFound;
    }

    // Check if the requester is involved in this expense
    const isInvolved = this.isUserInvolvedInExpense(requester.sub, expense);
    if (!isInvolved) {
      throw ErrUnauthorizedExpenseAccess;
    }

    return expense;
  }

  // Get all expenses for a group
  async getGroupExpenses(requester: Requester, groupId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }> {
    // Check if the group exists and if the requester is a member
    // This would require additional logic to check group membership
    // For now, we'll assume the check is done elsewhere

    return this.repository.findByGroupId(groupId, paging);
  }

  // Get all expenses for a user
  async getUserExpenses(requester: Requester, userId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }> {
    // Only allow users to see their own expenses or admins to see any user's expenses
    if (requester.sub !== userId && requester.role !== 'admin') {
      throw ErrUnauthorizedExpenseAccess;
    }

    return this.repository.findByUserId(userId, paging);
  }

  // Update an existing expense
  async updateExpense(requester: Requester, expenseId: string, expenseData: Partial<ExpenseDTO>): Promise<Expense> {
    // Check if the expense exists
    const existingExpense = await this.repository.findById(expenseId);
    if (!existingExpense) {
      throw ErrExpenseNotFound;
    }

    // Check if the requester is the one who paid for the expense or has admin permissions
    if (requester.sub !== existingExpense.paidById && requester.role !== 'admin') {
      throw ErrUnauthorizedExpenseAccess;
    }

    // If updating splits, validate the data
    if (expenseData.splitWith) {
      this.validateSplits(expenseData.amount || existingExpense.amount, expenseData.splitWith);
    }

    // Update the expense
    return this.repository.update(expenseId, expenseData);
  }

  // Delete an expense
  async deleteExpense(requester: Requester, expenseId: string): Promise<boolean> {
    // Check if the expense exists
    const existingExpense = await this.repository.findById(expenseId);
    if (!existingExpense) {
      throw ErrExpenseNotFound;
    }

    // Check if the requester is the one who paid for the expense or has admin permissions
    if (requester.sub !== existingExpense.paidById && requester.role !== 'admin') {
      throw ErrUnauthorizedExpenseAccess;
    }

    // Delete the expense
    return this.repository.delete(expenseId);
  }

  // Get balances for a group
  async getGroupBalances(requester: Requester, groupId: string): Promise<Balance[]> {
    // Check if the group exists and if the requester is a member
    // This would require additional logic to check group membership
    // For now, we'll assume the check is done elsewhere

    return this.repository.getGroupBalances(groupId);
  }

  // Helper methods
  private validateExpenseData(expenseData: ExpenseDTO): void {
    // Check required fields
    if (!expenseData.title || !expenseData.amount || !expenseData.paidById || !expenseData.splitWith || !expenseData.category) {
      throw ErrInvalidExpenseData;
    }

    // Validate splits
    this.validateSplits(expenseData.amount, expenseData.splitWith);

    // Check if the payer is included in the split
    const isPaidByInSplit = expenseData.splitWith.some(split => split.userId === expenseData.paidById);
    if (!isPaidByInSplit) {
      throw ErrPaidByNotInSplit;
    }
  }

  private validateSplits(totalAmount: number, splits: { userId: string; amount: number }[]): void {
    // Check if splits are provided
    if (!splits || splits.length === 0) {
      throw ErrInvalidExpenseData;
    }

    // Calculate the sum of split amounts
    const splitSum = splits.reduce((sum, split) => sum + split.amount, 0);

    // Check if the sum matches the total amount (allowing for small floating-point differences)
    if (Math.abs(splitSum - totalAmount) > 0.01) {
      throw ErrSplitAmountMismatch;
    }
  }

  private isUserInvolvedInExpense(userId: string, expense: Expense): boolean {
    // User is involved if they paid or are part of the split
    if (expense.paidById === userId) {
      return true;
    }

    return expense.splitWith.some(split => split.userId === userId);
  }

  // IUseCase interface implementation
  async create(data: ExpenseDTO): Promise<string> {
    const expense = await this.createExpense({ sub: data.paidById, role: 'user' }, data);
    return expense.id;
  }

  async getDetail(id: string): Promise<Expense | null> {
    try {
      // Since getExpense requires a requester, we'll need to fetch the expense first to get the paidById
      const expense = await this.repository.findById(id);
      if (!expense) return null;
      
      // Use the paidById as the requester to bypass authorization checks
      return await this.getExpense({ sub: expense.paidById, role: 'user' }, id);
    } catch (error) {
      if (error === ErrExpenseNotFound) return null;
      throw error;
    }
  }

  async list(cond: any, paging: PagingDTO): Promise<Paginated<Expense>> {
    // Depending on the condition, we'll call either getGroupExpenses or getUserExpenses
    if (cond && cond.groupId) {
      const result = await this.getGroupExpenses({ sub: '', role: 'admin' }, cond.groupId, paging);
      return {
        data: result.data,
        paging: {
          ...paging,
          total: result.data.length
        },
        total: result.data.length
      };
    } else if (cond && cond.userId) {
      const result = await this.getUserExpenses({ sub: cond.userId, role: 'user' }, cond.userId, paging);
      return {
        data: result.data,
        paging: {
          ...paging,
          total: result.data.length
        },
        total: result.data.length
      };
    }
    
    // Default: return empty list
    return {
      data: [],
      paging: {
        ...paging,
        total: 0
      },
      total: 0
    };
  }

  async update(id: string, data: Partial<ExpenseDTO>): Promise<boolean> {
    try {
      // Since updateExpense requires a requester, we'll need to fetch the expense first to get the paidById
      const expense = await this.repository.findById(id);
      if (!expense) return false;
      
      // Use the paidById as the requester to bypass authorization checks
      await this.updateExpense({ sub: expense.paidById, role: 'user' }, id, data);
      return true;
    } catch (error) {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Since deleteExpense requires a requester, we'll need to fetch the expense first to get the paidById
      const expense = await this.repository.findById(id);
      if (!expense) return false;
      
      // Use the paidById as the requester to bypass authorization checks
      return await this.deleteExpense({ sub: expense.paidById, role: 'user' }, id);
    } catch (error) {
      return false;
    }
  }
}