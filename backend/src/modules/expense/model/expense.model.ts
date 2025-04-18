export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string; // userId of person who paid
  paidFor: ExpenseSplit[]; // list of users the expense was for
  date: string;
  receipt?: string; // URL to receipt image
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCategory = 
  | 'ACCOMMODATION' 
  | 'FOOD' 
  | 'TRANSPORTATION' 
  | 'ACTIVITIES' 
  | 'SHOPPING' 
  | 'OTHER';

export interface ExpenseSplit {
  userId: string;
  username: string;
  amount: number; // amount owed by this user
  isPaid: boolean;
}

export interface CreateExpenseDto {
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string;
  paidFor: {
    userId: string;
    splitType: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
    value?: number; // percentage or fixed amount
  }[];
  date: string;
  receipt?: string;
}

export interface UpdateExpenseDto {
  description?: string;
  amount?: number;
  currency?: string;
  category?: ExpenseCategory;
  paidBy?: string;
  paidFor?: {
    userId: string;
    splitType: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
    value?: number;
  }[];
  date?: string;
  receipt?: string;
}

export interface ExpenseSummary {
  groupId: string;
  totalExpenses: number;
  currency: string;
  byCategory: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
  byMember: {
    userId: string;
    username: string;
    paid: number; // total amount paid by this user
    owes: number; // total amount owed by this user
    netBalance: number; // positive means user is owed money, negative means user owes money
  }[];
}
