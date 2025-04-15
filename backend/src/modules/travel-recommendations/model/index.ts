export interface TravelRecommendation {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  status: 'todo' | 'completed' | 'rejected';
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
  status?: 'todo' | 'completed' | 'rejected';
}

// Zod schemas for validation
import { z } from 'zod';

export const travelRecommendationRequestDTOSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const travelRecommendationUpdateDTOSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['todo', 'completed', 'rejected']).optional(),
});

export type TravelRecommendationStatus = 'todo' | 'completed' | 'rejected';
