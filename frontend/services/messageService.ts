import api from "./api";
import { Message } from "@/types";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/constants/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Socket.io connection
let socket: Socket | null = null;

// Initialize socket connection
const initializeSocket = async () => {
  if (!socket) {
    try {
      // Get authentication token
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.error('Authentication token not found');
        throw new Error('Authentication token not found');
      }
      
      // Make sure we're using the correct URL for the backend server
      // In development, this should be your local server address
      const socketUrl = 'http://localhost:3001';
      console.log('Connecting to socket server at:', socketUrl);

      // Configure Socket.IO to match backend settings with authentication
      socket = io(socketUrl, {
        // Include auth token
        auth: {
          token
        },
        // Don't specify path unless your backend uses a custom path
        // The default '/socket.io' path is used automatically
        transports: ['polling', 'websocket'], // Try polling first, then websocket for better compatibility
        reconnectionAttempts: 5,              // Try to reconnect 5 times
        reconnectionDelay: 1000,              // Start with 1 second delay
        reconnectionDelayMax: 5000,           // Maximum 5 seconds delay
        timeout: 20000,                       // 20 seconds timeout
        autoConnect: true,
        forceNew: true                        // Force a new connection to avoid conflicts
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
      throw error;
    }

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt #${attemptNumber}`);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        // Try to reconnect manually
        socket?.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export const messageService = {
  // Get socket instance
  getSocket: async () => {
    return socket || await initializeSocket();
  },

  // Check if socket is connected
  isConnected: () => {
    return socket?.connected || false;
  },

  // Ensure socket connection
  ensureConnection: async () => {
    try {
      const s = socket || await initializeSocket();
      if (!s.connected) {
        console.log('Socket not connected, attempting to connect...');
        s.connect();
      }
      return s;
    } catch (error) {
      console.error('Error ensuring socket connection:', error);
      throw error;
    }
  },

  // Join a group chat room
  joinGroupChat: async (groupId: string) => {
    try {
      const socket = await messageService.ensureConnection();
      socket.emit('joinGroup', groupId);
      console.log(`Joined group chat: ${groupId}`);
    } catch (error) {
      console.error(`Error joining group chat ${groupId}:`, error);
    }
  },

  // Leave a group chat room
  leaveGroupChat: (groupId: string) => {
    if (socket && socket.connected) {
      socket.emit('leaveGroup', groupId);
      console.log(`Left group chat: ${groupId}`);
    }
  },

  // Get messages for a group
  getGroupMessages: async (groupId: string, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/v1/messages/group/${groupId}?page=${page}&limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return [];
    }
  },
  
  // Send a message through Socket.IO
  sendMessage: async (messageData: Partial<Message>) => {
    try {
      // First, ensure socket is connected
      const socket = await messageService.ensureConnection();
      
      // Create a temporary message object for immediate UI feedback
      const tempMessage = {
        id: `temp-${Date.now()}`,
        groupId: messageData.groupId || "",
        senderId: messageData.senderId || "",
        text: messageData.text || "",
        timestamp: new Date().toISOString(),
        attachments: messageData.attachments,
        mentions: messageData.mentions,
        pending: true // Flag to indicate this is a pending message
      };
      
      // Emit the message through socket for real-time delivery
      socket.emit('sendMessage', messageData, (ackResponse: any) => {
        // Optional: Handle acknowledgment if the server supports it
        if (ackResponse && ackResponse.error) {
          console.error('Message delivery error:', ackResponse.error);
        } else if (ackResponse && ackResponse.success) {
          console.log('Message delivered successfully');
        }
      });
      
      return tempMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Send typing indicator
  sendTypingIndicator: (groupId: string, userId: string) => {
    try {
      if (socket && socket.connected) {
        socket.emit('typing', { groupId, userId });
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  },
  
  // Send stopped typing indicator
  sendStoppedTypingIndicator: (groupId: string, userId: string) => {
    try {
      if (socket && socket.connected) {
        socket.emit('stopTyping', { groupId, userId });
      }
    } catch (error) {
      console.error('Error sending stopped typing indicator:', error);
    }
  },
  
  // Reconnect socket if disconnected
  reconnect: () => {
    if (socket && !socket.connected) {
      console.log('Attempting to reconnect socket...');
      socket.connect();
      return true;
    }
    return false;
  },
  
  // Disconnect socket
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('Socket disconnected and reference cleared');
    }
  }
};