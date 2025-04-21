export interface TripGroup {
  id: string;
  name: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: GroupMember[];
  itineraryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  username: string;
  role: 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'PENDING' | 'LEFT';
  joinedAt: Date;
}

export interface CreateTripGroupDto {
  name: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
  selectedLocations?: Location[];
}

export interface UpdateTripGroupDto {
  name?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
}

export interface TripGroupInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
  updatedAt: Date;
}


export type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  participants: string[]; // IDs of friends participating
  image?: string;
};

export type Expense = {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string; // ID of the friend who paid
  date: string;
  splitType: 'equally' | 'custom';
  splitWith: string[]; // IDs of friends to split with
  notes?: string;
  category?: string;
};

export type ExpenseSummary = {
  totalAmount: number;
  yourShare: number;
  currency: string;
  youPaid: number;
  youOwe: number;
  owedToYou: number;
};