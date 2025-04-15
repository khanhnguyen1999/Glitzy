import { Server as SocketIOServer } from 'socket.io';
import { MessageService } from '../service';
import { MessageDTO } from '../model';
import prisma from "@shared/components/prisma";

export class MessageWebSocketHandler {
  constructor(
    private io: SocketIOServer,
    private messageService: MessageService
  ) {
    this.setupSocketEvents();
  }
  
  private setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Join a group chat room
      socket.on('joinGroup', (groupId: string) => {
        socket.join(`group-${groupId}`);
        console.log(`User ${socket.id} joined group ${groupId}`);
      });
      
      // Leave a group chat room
      socket.on('leaveGroup', (groupId: string) => {
        socket.leave(`group-${groupId}`);
        console.log(`User ${socket.id} left group ${groupId}`);
      });
      
      // Send a message to a group
      socket.on('sendMessage', async (messageData: MessageDTO) => {
        try {
          // Save message to database
          const savedMessage = await this.messageService.createMessage(messageData);
          
          // Get sender information
          const sender = await prisma.users.findUnique({
            where: { id: messageData.senderId }
          });
          
          // Combine message with sender info
          const messageWithSender = {
            ...savedMessage,
            sender: {
              id: sender?.id,
              firstName: sender?.firstName,
              lastName: sender?.lastName,
              avatar: sender?.avatar,
              username: sender?.username
            }
          };
          
          // Broadcast the message to all users in the group
          this.io.to(`group-${messageData.groupId}`).emit('newMessage', messageWithSender);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('messageError', { message: 'Failed to send message' });
        }
      });
      
      // User is typing indicator
      socket.on('typing', (data: { groupId: string, userId: string }) => {
        socket.to(`group-${data.groupId}`).emit('userTyping', data.userId);
      });
      
      // User stopped typing indicator
      socket.on('stopTyping', (data: { groupId: string, userId: string }) => {
        socket.to(`group-${data.groupId}`).emit('userStoppedTyping', data.userId);
      });
      
      // Disconnect event
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
  
  // Method to send a system message to a group
  public sendSystemMessage(groupId: string, text: string) {
    this.io.to(`group-${groupId}`).emit('systemMessage', {
      groupId,
      text,
      timestamp: new Date()
    });
  }
}
