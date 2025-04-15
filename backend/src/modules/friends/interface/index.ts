import { ICommandRepository, IRepository, IUseCase, Requester } from "@shared/interface";
import { Paginated, PagingDTO } from "@shared/model";
import { Friend, FriendCondDTO, FriendRequestDTO, FriendResponseDTO, FriendSearchDTO, FriendUpdateDTO } from "../model";

export interface IFriendUseCase extends IUseCase<FriendRequestDTO, FriendUpdateDTO, Friend, FriendCondDTO> {
  // Send a friend request to another user by ID or email
  sendFriendRequest(requester: Requester, data: FriendRequestDTO): Promise<string>;
  
  // Accept a friend request
  acceptFriendRequest(requester: Requester, requestId: string): Promise<boolean>;
  
  // Reject a friend request
  rejectFriendRequest(requester: Requester, requestId: string): Promise<boolean>;
  
  // Cancel a friend request that was sent
  cancelFriendRequest(requester: Requester, requestId: string): Promise<boolean>;
  
  // Remove an existing friend
  removeFriend(requester: Requester, friendId: string): Promise<boolean>;
  
  // Get list of friends for a user
  getFriendsList(requester: Requester, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>>;
  
  // Search for friends by name or email
  searchFriends(requester: Requester, searchData: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>>;
  
  // Get mutual friends (optional)
  getMutualFriends(requester: Requester, userId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>>;
}

export interface IFriendCommandRepository extends ICommandRepository<Friend, FriendUpdateDTO> {
  // Add any specific command methods for friend repository here
}

export interface IFriendQueryRepository extends IRepository<Friend, FriendCondDTO, FriendUpdateDTO> {
  // Find friend requests by user ID and status
  findFriendRequestsByUserIdAndStatus(userId: string, status: string): Promise<Friend[]>;
  
  // Find friend request between two users
  findFriendRequestBetweenUsers(userId: string, friendId: string): Promise<Friend | null>;
  
  // Find friends of a user
  findFriendsByUserId(userId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>>;
  
  // Search friends by name or email
  searchFriendsByNameOrEmail(userId: string, query: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>>;
  
  // Find mutual friends between two users
  findMutualFriends(userId: string, otherUserId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>>;
}
