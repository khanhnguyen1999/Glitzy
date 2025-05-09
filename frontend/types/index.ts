export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    friends?: [],
    groups?: [],
    createdAt?: string,
    preferredCurrency?: string;
    user: {
      id: string,
      firstName: string,
      lastName: string,
      avatar?: string,
      username: string,
    }
  }

  export type GroupCategory = 
    | "travel"
    | "roommates"
    | "event"
    | "family"
    | "friends"
    | "other";

  export interface Group {
    id: string;
    name: string;
    description?: string;
    members: User[];
    memberIds?: string[];
    category?: GroupCategory;
    location?: string;
    createdAt: string;
    updatedAt: string;
    totalBalance: number;
    coverImage?: string;
    image?: string;
  }

  export interface Friend {
    id: string;
    status: string;
    balance: number;
    addedAt: string;
    friend: {
      id: string,
      firstName: string,
      lastName: string,
      avatar?: string,
      username: string,
    }
  }

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
    date?: string;
    notes?: string;
    currency?: string;
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
    date: string;
    notes?: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Settlement {
    id: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    currency: string;
    date: string;
    status: "pending" | "completed";
    method: "cash" | "online" | "bank";
    notes?: string;
  }

  export interface Activity {
    id: string;
    type: "expense" | "settlement" | "group" | "friend";
    date: string;
    data: any;
    read: boolean;
  }

  export type ExpenseCategory =
    | "food"
    | "transportation"
    | "housing"
    | "utilities"
    | "entertainment"
    | "shopping"
    | "health"
    | "travel"
    | "education"
    | "other";

  export interface Message {
    id: string;
    groupId: string;
    senderId: string;
    text: string;
    timestamp: string;
    attachments?: string[];
    mentions?: string[];
    pending?: boolean;
    sender?: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      username?: string;
    };
  }

  export interface User {
    id: string;
    name: string;
    avatar?: string;
  }
  
  export interface Expense {
    id: string;
    tripId: string;
    title: string;
    amount: number;
    paidBy: string; // User ID
    paidByName: string; // User name
    date: string;
    splitType: 'equally' | 'percentage' | 'custom';
    participants: string[]; // User IDs
  }
  
  export interface Trip {
    id: string;
    name: string;
    participants: User[];
    startDate?: string;
    endDate?: string;
    location?: string;
    image?: string;
    status: 'active' | 'planning' | 'completed';
  }
  
  export interface TripWithExpenses extends Trip {
    expenses: Expense[];
  }
  
  export interface ItineraryActivity {
    id: string;
    tripId: string;
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    duration: number; // in hours
    location?: string;
    type: 'attraction' | 'food' | 'transport' | 'accommodation' | 'other';
    notes?: string;
    participants: string[]; // User IDs
    status?: 'confirmed' | 'pending' | 'cancelled';
  }