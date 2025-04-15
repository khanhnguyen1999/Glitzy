import { io, Socket } from 'socket.io-client';
import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/types';

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

class ChatService {
  private socket: Socket | null = null;
  private apiUrl = 'http://localhost:3001';
  
  // Initialize socket connection
  async initSocket() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      this.socket = io(this.apiUrl, {
        auth: {
          token
        },
        transports: ['websocket']
      });
      
      this.setupSocketListeners();
      
      return this.socket;
    } catch (error) {
      console.error('Socket initialization error:', error);
      throw error;
    }
  }
  
  // Get socket instance (initialize if needed)
  async getSocket() {
    if (!this.socket) {
      return this.initSocket();
    }
    return this.socket;
  }
  
  // Set up socket event listeners
  private setupSocketListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  
  // Join a chat room
  async joinRoom(roomId: string) {
    const socket = await this.getSocket();
    return new Promise<void>((resolve, reject) => {
      // Set up a timeout to avoid hanging indefinitely
      const timeout = setTimeout(() => {
        socket.off('room_joined');
        socket.off('error');
        reject(new Error('Timeout joining room'));
      }, 10000); // 10 second timeout
      
      socket.emit('join_room', roomId);
      
      socket.once('room_joined', () => {
        clearTimeout(timeout);
        socket.off('error'); // Remove error listener to avoid memory leaks
        resolve();
      });
      
      socket.once('error', (error) => {
        clearTimeout(timeout);
        socket.off('room_joined'); // Remove success listener to avoid memory leaks
        console.error('Error joining room:', error);
        reject(error);
      });
    });
  }
  
  // Leave a chat room
  async leaveRoom(roomId: string) {
    const socket = await this.getSocket();
    socket.emit('leave_room', roomId);
  }
  
  // Send a message
  async sendMessage(roomId: string, content: string): Promise<Message> {
    const socket = await this.getSocket();
    
    return new Promise((resolve, reject) => {
      const messageData = {
        roomId,
        content
      };
      
      socket.emit('send_message', messageData);
      
      socket.once('new_message', (message: ChatMessage) => {
        // Convert backend message format to frontend format
        const frontendMessage: Message = {
          id: message.id,
          groupId: message.roomId,
          senderId: message.senderId,
          text: message.content,
          timestamp: message.timestamp
        };
        resolve(frontendMessage);
      });
      
      socket.once('error', (error) => {
        reject(error);
      });
    });
  }
  
  // Mark messages as read
  async markMessagesAsRead(roomId: string) {
    const socket = await this.getSocket();
    socket.emit('mark_read', roomId);
  }
  
  // Get private chat history
  async getPrivateChatHistory(userId: string): Promise<Message[]> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get(`/v1/chat/private/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Convert backend message format to frontend format
      return response.data.data.data.map((message: ChatMessage) => ({
        id: message.id,
        groupId: message.roomId,
        senderId: message.senderId,
        text: message.content,
        timestamp: message.timestamp
      }));
    } catch (error) {
      console.error('Error fetching private chat history:', error);
      throw error;
    }
  }
  
  // Get group chat history
  async getGroupChatHistory(groupId: string): Promise<Message[]> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get(`/v1/chat/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Convert backend message format to frontend format
      return response.data.map((message: ChatMessage) => ({
        id: message.id,
        groupId: message.roomId,
        senderId: message.senderId,
        text: message.content,
        timestamp: message.timestamp
      }));
    } catch (error) {
      console.error('Error fetching group chat history:', error);
      throw error;
    }
  }
  
  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();
