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
}

export interface UpdateTripGroupDto {
  name?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
}

export interface AddGroupMemberDto {
  userId: string;
  role?: 'ADMIN' | 'MEMBER';
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
