import { IChatCommandRepository, IChatQueryRepository, IChatRepository } from '@modules/chat/interface';
import { ChatMessage, ChatMessageDTO, ChatRoom, ChatRoomDTO } from '@modules/chat/model';
import { PrismaClient, chat_rooms_status, chat_rooms_type } from '@prisma/client';
import { PagingDTO } from '@shared/model';
import { v4 as uuidv4 } from 'uuid';

export class PrismaChatQueryRepository implements IChatQueryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findRoomById(roomId: string): Promise<ChatRoom | null> {
    const room = await this.prisma.chatRooms.findUnique({
      where: { id: roomId }
    });

    if (!room) return null;

    return {
      id: room.id,
      creatorId: room.creatorId,
      receiverId: room.receiverId,
      type: room.type as chat_rooms_type,
      status: room.status as chat_rooms_status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      deletedAt: room.deletedAt || undefined
    };
  }

  async findPrivateRoom(userId: string, friendId: string): Promise<ChatRoom | null> {
    // Find direct chat room between these two users
    const room = await this.prisma.chatRooms.findFirst({
      where: {
        type: 'direct',
        OR: [
          {
            creatorId: userId,
            receiverId: friendId
          },
          {
            creatorId: friendId,
            receiverId: userId
          }
        ],
        status: chat_rooms_status.accepted
      }
    });

    if (!room) return null;

    // Get the last message for this room
    const lastMessage = await this.prisma.chatMessages.findFirst({
      where: { roomId: room.id },
      orderBy: { createdAt: 'desc' }
    });

    // Get unread count for this user
    const unreadCount = await this.prisma.chatMessages.count({
      where: {
        roomId: room.id,
        senderId: { not: userId }, // Messages not sent by this user
        // Add a condition for unread messages if you have that field
      }
    });

    return {
      id: room.id,
      creatorId: room.creatorId,
      receiverId: room.receiverId,
      type: room.type as chat_rooms_type,
      status: room.status as chat_rooms_status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      deletedAt: room.deletedAt || undefined,
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        roomId: lastMessage.roomId,
        senderId: lastMessage.senderId,
        content: lastMessage.content || '',
        createdAt: lastMessage.createdAt,
        updatedAt: lastMessage.updatedAt
      } : undefined,
      unreadCount
    };
  }

  async findGroupRoom(groupId: string): Promise<ChatRoom | null> {
    // Find group chat room
    const room = await this.prisma.chatRooms.findFirst({
      where: {
        type: 'group',
        receiverId: groupId, // Using receiverId to store groupId for group chats
        status: chat_rooms_status.accepted
      }
    });

    if (!room) return null;

    // Get the last message for this room
    const lastMessage = await this.prisma.chatMessages.findFirst({
      where: { roomId: room.id },
      orderBy: { createdAt: 'desc' }
    });

    return {
      id: room.id,
      creatorId: room.creatorId,
      receiverId: room.receiverId,
      type: room.type as chat_rooms_type,
      status: room.status as chat_rooms_status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      deletedAt: room.deletedAt || undefined,
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        roomId: lastMessage.roomId,
        senderId: lastMessage.senderId,
        content: lastMessage.content || '',
        createdAt: lastMessage.createdAt,
        updatedAt: lastMessage.updatedAt
      } : undefined
    };
  }

  async getMessagesByRoomId(roomId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }> {
    const { page, limit } = paging;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessages.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.chatMessages.count({ where: { roomId } })
    ]);

    // Get user info for each message sender
    const messagesWithSenderInfo = await Promise.all(
      messages.map(async (message) => {
        const sender = await this.prisma.users.findUnique({
          where: { id: message.senderId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        });

        return {
          id: message.id,
          roomId: message.roomId,
          senderId: message.senderId,
          content: message.content || '',
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          senderInfo: sender ? {
            id: sender.id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            avatar: sender.avatar || undefined
          } : undefined
        };
      })
    );

    const pages = Math.ceil(total / limit);

    return {
      data: messagesWithSenderInfo,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }
}

export class PrismaChatCommandRepository implements IChatCommandRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createRoom(roomData: ChatRoomDTO): Promise<ChatRoom> {
    const room = await this.prisma.chatRooms.create({
      data: {
        id: roomData.id || uuidv4(),
        creatorId: roomData.creatorId,
        receiverId: roomData.receiverId,
        type: roomData.type,
        status: roomData.status || chat_rooms_status.accepted
      }
    });

    return {
      id: room.id,
      creatorId: room.creatorId,
      receiverId: room.receiverId,
      type: room.type as chat_rooms_type,
      status: room.status as chat_rooms_status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      deletedAt: room.deletedAt || undefined
    };
  }

  async saveMessage(messageData: ChatMessageDTO): Promise<ChatMessage> {
    console.log('Saving message with data:', messageData);
    
    try {
      // Make sure we're using the correct model name based on the Prisma schema
      const message = await this.prisma.chatMessages.create({
        data: {
          id: messageData.id || uuidv4(),
          roomId: messageData.roomId,
          senderId: messageData.senderId,
          content: messageData.content || ''
        }
      });
      
      // Update the room's updatedAt timestamp
      try {
        await this.prisma.chatRooms.update({
          where: { id: messageData.roomId },
          data: { updatedAt: new Date() }
        });
      } catch (roomUpdateError) {
        console.error('Error updating chat room timestamp:', roomUpdateError);
        // Continue despite room update error
      }

      // Get sender info
      let sender = null;
      try {
        sender = await this.prisma.users.findUnique({
          where: { id: message.senderId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        });
      } catch (senderError) {
        console.error('Error fetching sender info:', senderError);
        // Continue without sender info
      }

      return {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        content: message.content || '',
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        senderInfo: sender ? {
          id: sender.id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          avatar: sender.avatar || undefined
        } : undefined
      };
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(userId: string, roomId: string): Promise<boolean> {
    // This would require adding an isRead field to the ChatMessages table
    // For now, we'll just return true as a placeholder
    // In a real implementation, you would update all unread messages in the room for this user
    return true;
  }
}

export class PrismaChatRepository implements IChatRepository {
  private queryRepository: IChatQueryRepository;
  private commandRepository: IChatCommandRepository;

  constructor(queryRepository: IChatQueryRepository, commandRepository: IChatCommandRepository) {
    this.queryRepository = queryRepository;
    this.commandRepository = commandRepository;
  }

  async createRoom(roomData: ChatRoomDTO): Promise<ChatRoom> {
    return this.commandRepository.createRoom(roomData);
  }

  async findRoomById(roomId: string): Promise<ChatRoom | null> {
    return this.queryRepository.findRoomById(roomId);
  }

  async findPrivateRoom(userId: string, friendId: string): Promise<ChatRoom | null> {
    return this.queryRepository.findPrivateRoom(userId, friendId);
  }

  async findGroupRoom(groupId: string): Promise<ChatRoom | null> {
    return this.queryRepository.findGroupRoom(groupId);
  }

  async saveMessage(messageData: ChatMessageDTO): Promise<ChatMessage> {
    return this.commandRepository.saveMessage(messageData);
  }

  async getMessagesByRoomId(roomId: string, paging: PagingDTO): Promise<{ data: ChatMessage[], pagination: any }> {
    return this.queryRepository.getMessagesByRoomId(roomId, paging);
  }

  async markMessagesAsRead(userId: string, roomId: string): Promise<boolean> {
    return this.commandRepository.markMessagesAsRead(userId, roomId);
  }
}
