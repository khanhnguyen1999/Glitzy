export interface Message {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  status?: 'SENDING' | 'SENT' | 'ERROR'; // UI status for optimistic updates
}

export interface SendMessageDto {
  tripId: string;
  content: string;
}

export interface ChatRoom {
  id: string;
  tripId: string;
  name: string;
  participants: {
    userId: string;
    username: string;
  }[];
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
