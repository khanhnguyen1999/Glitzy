import { v4 as uuidv4 } from 'uuid';
import prisma from "@shared/components/prisma";
import { PagingDTO } from '@shared/model';
import { IMessageCommandRepository, IMessageQueryRepository } from '../../interface';
import { Message, MessageDTO, MessageResponseDTO } from '../../model';

export class PrismaMessageQueryRepository implements IMessageQueryRepository {
  async findByGroupId(groupId: string, paging: PagingDTO): Promise<{ data: MessageResponseDTO[], pagination: any }> {
    const { page = 1, limit = 20 } = paging;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await prisma.messages.count({
      where: { groupId }
    });

    // Get messages with sender information
    const messages: any[] = await prisma.$queryRaw`
      SELECT 
        m.id, m.group_id as "groupId", m.sender_id as "senderId", 
        m.text, m.attachments, m.mentions, m.created_at as "createdAt", 
        m.updated_at as "updatedAt", m.timestamp,
        u.id as "sender.id", u.first_name as "sender.firstName", 
        u.last_name as "sender.lastName", u.avatar as "sender.avatar",
        u.username as "sender.username"
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.group_id = ${groupId}
      ORDER BY m.timestamp DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Transform raw query results
    const formattedMessages = messages.map((message: any) => {
      const { 'sender.id': senderId, 'sender.firstName': firstName, 'sender.lastName': lastName, 
              'sender.avatar': avatar, 'sender.username': username, ...rest } = message;
      
      return {
        ...rest,
        sender: {
          id: senderId,
          firstName,
          lastName,
          avatar,
          username
        }
      };
    });

    return {
      data: formattedMessages as MessageResponseDTO[],
      pagination: {
        total,
        page,
        limit
      }
    };
  }

  async findById(id: string): Promise<Message | null> {
    const message = await prisma.messages.findUnique({
      where: { id }
    });
    
    return message as unknown as Message | null;
  }
}

export class PrismaMessageCommandRepository implements IMessageCommandRepository {
  async create(messageData: MessageDTO): Promise<Message> {
    const { id = uuidv4(), groupId, senderId, text, attachments = [], mentions = [] } = messageData;
    
    const message = await prisma.messages.create({
      data: {
        id,
        groupId,
        senderId,
        text,
        attachments: attachments || [],
        mentions: mentions || [],
        timestamp: new Date()
      }
    });
    
    return message as unknown as Message;
  }

  async delete(id: string): Promise<void> {
    await prisma.messages.delete({
      where: { id }
    });
  }
}
