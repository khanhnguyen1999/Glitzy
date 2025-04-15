export type ExpenseCategory = 
  | 'food'
  | 'transportation'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'travel'
  | 'education'
  | 'other';

export interface ExpenseSplit {
  userId: string;
  amount: number;
  userInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface ExpenseDTO {
  id?: string;
  title: string;
  amount: number;
  paidById: string;
  splitWith: ExpenseSplit[];
  groupId?: string;
  category: ExpenseCategory;
  date?: Date;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  paidByInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  splitWith: ExpenseSplit[];
  groupId?: string;
  groupInfo?: {
    id: string;
    name: string;
    image?: string;
  };
  category: ExpenseCategory;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Balance {
  userId: string;
  userName: string;
  balance: number;
  currency: string;
}