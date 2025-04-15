import { PagingDTO } from '@shared/model';
import { Requester } from '@shared/interface';
import { ChatMessage, ChatRoom, ChatMessageDTO, ChatRoomDTO } from '../model';

export interface IChatUseCase {
  // Room operations
  createRoom(requester: Requester, roomData: ChatRoomDTO): Promise<ChatRoom>;
  getRoomById(roomId: string): Promise<ChatRoom | null>;
  getPrivateRoom(requester: Requester, userId: string): Promise<ChatRoom>;
  getGroupRoom(groupId: string): Promise<ChatRoom>;
  
  // Message operations
  sendMessage(requester: Requester, messageData: ChatMessageDTO): Promise<ChatMessage>;
  getPrivateChatHistory(requester: Requester, userId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }>;
  getGroupChatHistory(requester: Requester, groupId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }>;
  
  // Socket operations
  joinRoom(userId: string, roomId: string): Promise<boolean>;
  leaveRoom(userId: string, roomId: string): Promise<boolean>;
  markMessagesAsRead(userId: string, roomId: string): Promise<boolean>;
}

export interface IChatRepository {
  // Room operations
  createRoom(roomData: ChatRoomDTO): Promise<ChatRoom>;
  findRoomById(roomId: string): Promise<ChatRoom | null>;
  findPrivateRoom(userId: string, friendId: string): Promise<ChatRoom | null>;
  findGroupRoom(groupId: string): Promise<ChatRoom | null>;
  
  // Message operations
  saveMessage(messageData: ChatMessageDTO): Promise<ChatMessage>;
  getMessagesByRoomId(roomId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }>;
  markMessagesAsRead(userId: string, roomId: string): Promise<boolean>;
}

export interface IChatQueryRepository {
  findRoomById(roomId: string): Promise<ChatRoom | null>;
  findPrivateRoom(userId: string, friendId: string): Promise<ChatRoom | null>;
  findGroupRoom(groupId: string): Promise<ChatRoom | null>;
  getMessagesByRoomId(roomId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }>;
}

export interface IChatCommandRepository {
  createRoom(roomData: ChatRoomDTO): Promise<ChatRoom>;
  saveMessage(messageData: ChatMessageDTO): Promise<ChatMessage>;
  markMessagesAsRead(userId: string, roomId: string): Promise<boolean>;
}