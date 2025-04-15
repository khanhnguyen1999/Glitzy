export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  attachments?: string[];
  mentions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDTO {
  id?: string;
  groupId: string;
  senderId: string;
  text: string;
  attachments?: string[];
  mentions?: string[];
}

export interface MessageResponseDTO extends Message {
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    username: string;
  };
}

export interface PaginatedMessagesResponse {
  data: MessageResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
