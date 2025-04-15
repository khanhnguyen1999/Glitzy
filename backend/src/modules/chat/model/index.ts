import { chat_rooms_status, chat_rooms_type } from '@prisma/client';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isRead?: boolean;
  senderInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface ChatRoom {
  id: string;
  creatorId: string;
  receiverId: string;
  type: chat_rooms_type;
  status: chat_rooms_status;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ChatMessageDTO {
  id?: string;
  roomId: string;
  senderId: string;
  content: string;
  isRead?: boolean;
}

export interface ChatRoomDTO {
  id?: string;
  creatorId: string;
  receiverId: string;
  type: chat_rooms_type;
  status?: chat_rooms_status;
}

export interface ChatCondDTO {
  userId?: string;
  roomId?: string;
  groupId?: string;
  friendId?: string;
  isRead?: boolean;
}

export interface ChatUpdateDTO {
  status?: chat_rooms_status;
  isRead?: boolean;
}