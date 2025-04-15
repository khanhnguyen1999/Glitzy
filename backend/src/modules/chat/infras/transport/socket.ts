import { IChatUseCase } from '@modules/chat/interface';
import { ChatMessageDTO } from '@modules/chat/model';
import { jwtProvider } from '@shared/components/jwt';
import { Requester } from '@shared/interface';
import { Server, Socket } from 'socket.io';

export class ChatSocketService {
  private io: Server;
  private usecase: IChatUseCase;

  constructor(io: Server, usecase: IChatUseCase) {
    this.io = io;
    this.usecase = usecase;
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.io.use(async (socket, next) => {
      try {
        // Get token from handshake auth
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        // Verify token
        const payload = await jwtProvider.verifyToken(token);
        if (!payload) {
          return next(new Error('Authentication error: Invalid token'));
        }

        // Attach user data to socket
        socket.data.user = payload as Requester;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.user.sub}`);
      
      // Handle joining rooms
      socket.on('join_room', async (roomId) => {
        try {
          const userId = socket.data.user.sub;
          await this.usecase.joinRoom(userId, roomId);
          socket.join(roomId);
          socket.emit('room_joined', roomId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('error', { message: errorMessage });
        }
      });

      // Handle leaving rooms
      socket.on('leave_room', async (roomId) => {
        try {
          const userId = socket.data.user.sub;
          await this.usecase.leaveRoom(userId, roomId);
          socket.leave(roomId);
          socket.emit('room_left', roomId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('error', { message: errorMessage });
        }
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const requester = socket.data.user;
          const messageData: ChatMessageDTO = {
            roomId: data.roomId,
            senderId: requester.sub,
            content: data.content,
          };

          const message = await this.usecase.sendMessage(requester, messageData);
          
          // Broadcast to all users in the room
          this.io.to(data.roomId).emit('new_message', message);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('error', { message: errorMessage });
        }
      });

      // Handle marking messages as read
      socket.on('mark_read', async (roomId) => {
        try {
          const userId = socket.data.user.sub;
          await this.usecase.markMessagesAsRead(userId, roomId);
          
          // Notify other users in the room that messages have been read
          socket.to(roomId).emit('messages_read', { userId, roomId });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('error', { message: errorMessage });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.user.sub}`);
      });
    });
  }
}
