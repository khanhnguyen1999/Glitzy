export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  username: string;
  name?: string;
  profilePicture?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
  updatedAt: Date;
}

export interface SendFriendRequestDto {
  username: string;
}

export interface RespondToFriendRequestDto {
  requestId: string;
  accept: boolean;
}


