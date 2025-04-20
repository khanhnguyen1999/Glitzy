import { z } from "zod";

// This enum must match the database schema's friends_status enum
export enum FriendStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

// For virtual friend statuses that aren't stored in the database
export type VirtualFriendStatus = FriendStatus | 'none';

export const friendSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  friendId: z.string().uuid(),
  status: z.nativeEnum(FriendStatus).default(FriendStatus.PENDING),
  createdAt: z.date(),
});

export type Friend = z.infer<typeof friendSchema>;

// DTO for creating a friend request
export const friendRequestDTOSchema = z.object({
  friendId: z.string().uuid().or(z.string().email()),
});

export type FriendRequestDTO = z.infer<typeof friendRequestDTOSchema>;

// DTO for updating a friend request status
export const friendUpdateDTOSchema = z.object({
  status: z.nativeEnum(FriendStatus),
  userId: z.string().uuid().optional(),
  friendId: z.string().uuid().optional(),
});

export type FriendUpdateDTO = z.infer<typeof friendUpdateDTOSchema>;

// DTO for searching friends
export const friendSearchDTOSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type FriendSearchDTO = z.infer<typeof friendSearchDTOSchema>;

// DTO for conditions when querying friends
export const friendCondDTOSchema = friendSchema.pick({
  userId: true,
  friendId: true,
  status: true,
}).partial();

export type FriendCondDTO = z.infer<typeof friendCondDTOSchema>;

// DTO for friend response with user details
export const friendResponseDTOSchema = friendSchema.extend({
  friend: z.object({
    id: z.string(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().nullable().optional(),
  }),
});

export type FriendResponseDTO = z.infer<typeof friendResponseDTOSchema>;
