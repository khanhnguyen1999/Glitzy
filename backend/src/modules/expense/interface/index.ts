import { Balance, Expense, ExpenseDTO } from '../model';
import { PagingDTO } from '@shared/model';

export interface IExpenseQueryRepository {
  findById(expenseId: string): Promise<Expense | null>;
  findByGroupId(groupId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }>;
  findByUserId(userId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }>;
  getGroupBalances(groupId: string): Promise<Balance[]>;
}

export interface IExpenseCommandRepository {
  create(expenseData: ExpenseDTO): Promise<Expense>;
  update(expenseId: string, expenseData: Partial<ExpenseDTO>): Promise<Expense>;
  delete(expenseId: string): Promise<boolean>;
}

export interface IExpenseRepository extends IExpenseQueryRepository, IExpenseCommandRepository {}
