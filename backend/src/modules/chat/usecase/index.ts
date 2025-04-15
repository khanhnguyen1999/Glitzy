import { IChatRepository, IChatUseCase } from '@modules/chat/interface';
import { ChatMessage, ChatMessageDTO, ChatRoom, ChatRoomDTO } from '@modules/chat/model';
import { ErrChatRoomNotFound, ErrInvalidChatOperation, ErrUnauthorizedChatAccess } from '@modules/chat/model/error';
import { Requester } from '@shared/interface';
import { PagingDTO } from '@shared/model';
import { v4 as uuidv4 } from 'uuid';
import { chat_rooms_status } from '@prisma/client';

export class ChatUseCase implements IChatUseCase {
  private repository: IChatRepository;
  
  constructor(repository: IChatRepository) {
    this.repository = repository;
  }

  // Room operations
  async createRoom(requester: Requester, roomData: ChatRoomDTO): Promise<ChatRoom> {
    // For direct chats, check if a room already exists between these users
    if (roomData.type === 'direct') {
      const existingRoom = await this.repository.findPrivateRoom(requester.sub, roomData.receiverId);
      if (existingRoom) {
        return existingRoom;
      }
    }
    
    // For group chats, check if a room already exists for this group
    if (roomData.type === 'group') {
      const existingRoom = await this.repository.findGroupRoom(roomData.receiverId);
      if (existingRoom) {
        return existingRoom;
      }
    }
    
    // Create a new room
    const newRoomData: ChatRoomDTO = {
      id: uuidv4(),
      creatorId: requester.sub,
      receiverId: roomData.receiverId,
      type: roomData.type,
      status: chat_rooms_status.accepted
    };
    
    return this.repository.createRoom(newRoomData);
  }

  async getRoomById(roomId: string): Promise<ChatRoom | null> {
    return this.repository.findRoomById(roomId);
  }

  async getPrivateRoom(requester: Requester, userId: string): Promise<ChatRoom> {
    // Check if room exists
    const room = await this.repository.findPrivateRoom(requester.sub, userId);
    // If room doesn't exist, create it
    if (!room) {
      return this.createRoom(requester, {
        creatorId: requester.sub,
        receiverId: userId,
        type: 'direct'
      });
    }
    
    return room;
  }

  async getGroupRoom(groupId: string): Promise<ChatRoom> {
    // Check if room exists
    const room = await this.repository.findGroupRoom(groupId);
    if (!room) {
      console.log('getGroupRoom')
      throw ErrChatRoomNotFound;
    }
    
    return room;
  }

  // Message operations
  async sendMessage(requester: Requester, messageData: ChatMessageDTO): Promise<ChatMessage> {
    // Verify the room exists
    let room = null;
    let actualRoomId = messageData.roomId;
    
    // Handle custom formatted room IDs
    if (messageData.roomId.startsWith('private_')) {
      const userIds = messageData.roomId.replace('private_', '').split('_');
      if (userIds.length === 2) {
        // Find or create a private room between these users
        room = await this.repository.findPrivateRoom(userIds[0], userIds[1]);
        
        // If room doesn't exist, create it
        if (!room) {
          room = await this.repository.createRoom({
            creatorId: userIds[0],
            receiverId: userIds[1],
            type: 'direct',
            status: chat_rooms_status.accepted
          });
        }
        
        // Use the actual room ID from the database
        if (room) {
          actualRoomId = room.id;
        }
      }
    } else {
      // Regular room ID lookup
      room = await this.repository.findRoomById(messageData.roomId);
    }

    if (!room) {
      throw ErrChatRoomNotFound;
    }
    
    // Verify the user is allowed to send messages to this room
    if (room.type === 'direct') {
      // For direct chats, the user must be either the creator or receiver
      if (room.creatorId !== requester.sub && room.receiverId !== requester.sub) {
        throw ErrUnauthorizedChatAccess;
      }
    } else if (room.type === 'group') {
      // For group chats, we need to check if the user is a member of the group
      // This would require additional logic to check group membership
      // For now, we'll assume the check is done elsewhere
    }
    
    // Create the message
    const newMessageData: ChatMessageDTO = {
      id: uuidv4(),
      roomId: actualRoomId, // Use the actual room ID from the database
      senderId: requester.sub,
      content: messageData.content,
    };
    
    return this.repository.saveMessage(newMessageData);
  }

  async getPrivateChatHistory(requester: Requester, userId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }> {
    // Get or create the room
    const room = await this.getPrivateRoom(requester, userId);
    
    // Get messages for this room
    return this.repository.getMessagesByRoomId(room.id, paging);
  }

  async getGroupChatHistory(requester: Requester, groupId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }> {
    // Get the room
    const room = await this.getGroupRoom(groupId);
    
    // Get messages for this room
    return this.repository.getMessagesByRoomId(room.id, paging);
  }

  // Socket operations
  async joinRoom(userId: string, roomId: string): Promise<boolean> {
    let room = null;
    
    // Handle custom formatted room IDs (private_userId1_userId2)
    if (roomId.startsWith('private_')) {
      const userIds = roomId.replace('private_', '').split('_');
      if (userIds.length === 2) {
        // Find or create a private room between these users
        room = await this.repository.findPrivateRoom(userIds[0], userIds[1]);
        
        // If room doesn't exist, create it
        if (!room) {
          room = await this.repository.createRoom({
            creatorId: userIds[0],
            receiverId: userIds[1],
            type: 'direct',
            status: chat_rooms_status.accepted
          });
        }
      }
    } else {
      // Regular room ID lookup
      room = await this.repository.findRoomById(roomId);
    }
    console.log('test room ',room)
    // If room still not found, throw error
    if (!room) {
      console.log('joinRoom')
      throw ErrChatRoomNotFound;
    }
    
    // Verify the user is allowed to join this room
    if (room.type === 'direct') {
      // For direct chats, the user must be either the creator or receiver
      if (room.creatorId !== userId && room.receiverId !== userId) {
        throw ErrUnauthorizedChatAccess;
      }
    } else if (room.type === 'group') {
      // For group chats, we need to check if the user is a member of the group
      // This would require additional logic to check group membership
      // For now, we'll assume the check is done elsewhere
    }
    
    // In a real implementation, you might track active users in a room
    return true;
  }

  async leaveRoom(userId: string, roomId: string): Promise<boolean> {
    // Verify the room exists
    const room = await this.repository.findRoomById(roomId);
    if (!room) {
      throw ErrChatRoomNotFound;
    }
    
    // In a real implementation, you might remove the user from active users in a room
    return true;
  }

  async markMessagesAsRead(userId: string, roomId: string): Promise<boolean> {
    // Verify the room exists
    const room = await this.repository.findRoomById(roomId);
    if (!room) {
      throw ErrChatRoomNotFound;
    }
    
    // Verify the user is allowed to mark messages as read in this room
    if (room.type === 'direct') {
      // For direct chats, the user must be either the creator or receiver
      if (room.creatorId !== userId && room.receiverId !== userId) {
        throw ErrUnauthorizedChatAccess;
      }
    } else if (room.type === 'group') {
      // For group chats, we need to check if the user is a member of the group
      // This would require additional logic to check group membership
      // For now, we'll assume the check is done elsewhere
    }
    
    return this.repository.markMessagesAsRead(userId, roomId);
  }
}