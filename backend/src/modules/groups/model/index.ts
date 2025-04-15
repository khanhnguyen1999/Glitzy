import { z } from 'zod';

export enum GroupMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum GroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted'
}

export enum GroupCategory {
  TRAVEL = 'travel',
  ROOMMATES = 'roommates',
  EVENT = 'event',
  FAMILY = 'family',
  FRIENDS = 'friends',
  OTHER = 'other'
}

export enum TravelRecommendationStatus {
  TODO = 'todo',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  creatorId: string;
  category?: GroupCategory;
  location?: string | null;
  status: GroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupRequestDTO {
  name: string;
  description?: string;
  image?: string;
  category?: GroupCategory;
  location?: string;
  memberIds?: string[];
}

export interface GroupUpdateDTO {
  name?: string;
  description?: string;
  image?: string;
  category?: GroupCategory;
  location?: string;
  status?: GroupStatus;
}

export interface GroupMemberUpdateDTO {
  role: GroupMemberRole;
}

export interface GroupCondDTO {
  id?: string;
  name?: string;
  creatorId?: string;
  status?: GroupStatus;
}

export interface GroupMemberCondDTO {
  id?: string;
  groupId?: string;
  userId?: string;
  role?: GroupMemberRole;
}

export interface GroupResponseDTO extends Group {
  memberCount: number;
  isAdmin: boolean;
  members?: GroupMemberResponseDTO[];
}

export interface GroupMemberResponseDTO {
  id: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

// Zod schemas for validation
export const groupRequestDTOSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  category: z.nativeEnum(GroupCategory).optional(),
  location: z.string().max(255).optional(),
  memberIds: z.array(z.string()).optional(),
});

export const groupUpdateDTOSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  category: z.nativeEnum(GroupCategory).optional(),
  location: z.string().max(255).optional(),
  status: z.nativeEnum(GroupStatus).optional(),
});

export const groupMemberUpdateDTOSchema = z.object({
  role: z.nativeEnum(GroupMemberRole),
});

// Travel Recommendation interfaces
export interface TravelRecommendation {
  id: string;
  groupId: string;
  name: string;
  description?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  status: TravelRecommendationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelRecommendationRequestDTO {
  name: string;
  description?: string;
  address?: string;
  imageUrl?: string;
}

export interface TravelRecommendationUpdateDTO {
  name?: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  status?: TravelRecommendationStatus;
}

export const travelRecommendationRequestDTOSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const travelRecommendationUpdateDTOSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.nativeEnum(TravelRecommendationStatus).optional(),
});