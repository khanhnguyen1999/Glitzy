import { IFriendQueryRepository, IFriendUseCase } from '@modules/friends/interface';
import { Friend, FriendCondDTO, FriendRequestDTO, friendRequestDTOSchema, FriendResponseDTO, FriendSearchDTO, friendSearchDTOSchema, FriendStatus, FriendUpdateDTO, friendUpdateDTOSchema } from '@modules/friends/model';
import { ErrCannotSendRequestToSelf, ErrFriendAlreadyAccepted, ErrFriendAlreadyRejected, ErrFriendRequestAlreadyExists, ErrFriendRequestNotFound, ErrFriendshipNotFound, ErrUnauthorizedAction, ErrUserNotFound } from '@modules/friends/model/error';
import { Requester, UserRole } from '@shared/interface';
import { Paginated, PagingDTO } from '@shared/model';
import { AppError, ErrNotFound } from '@shared/utils/error';
import prisma from '@shared/components/prisma';
import { v7 } from 'uuid';

export class FriendUseCase implements IFriendUseCase {
  constructor(private readonly repository: IFriendQueryRepository) {}

  async create(data: FriendRequestDTO & { userId: string }): Promise<string> {
    return await this.sendFriendRequest({ sub: data.userId, role: UserRole.USER }, data);
  }

  async sendFriendRequest(requester: Requester, data: FriendRequestDTO): Promise<string> {
    const dto = friendRequestDTOSchema.parse(data);
    
    // Check if the user is trying to send a friend request to themselves
    if (dto.friendId === requester.sub) {
      throw AppError.from(ErrCannotSendRequestToSelf, 400);
    }
    
    // Check if a friend request already exists between these users
    const existingRequest = await this.repository.findFriendRequestBetweenUsers(requester.sub, dto.friendId);
    
    if (existingRequest) {
      // If the existing request is rejected, allow creating a new one by updating the status
      if (existingRequest.status === FriendStatus.REJECTED) {
        // Update the existing rejected request to pending
        await this.repository.update(existingRequest.id, { status: FriendStatus.PENDING, userId: requester.sub, friendId: dto.friendId });
        return existingRequest.id;
      } else {
        // For pending or accepted requests, don't allow creating a new one
        throw AppError.from(ErrFriendRequestAlreadyExists, 400);
      }
    }
    
    // Create new friend request if no existing request was found
    const newId = v7();
    const newFriendRequest: Friend = {
      id: newId,
      userId: requester.sub,
      friendId: dto.friendId,
      status: FriendStatus.PENDING,
      createdAt: new Date(),
    };

    await this.repository.insert(newFriendRequest);
    
    return newId;
  }
  
  async acceptFriendRequest(requester: Requester, requestId: string): Promise<boolean> {
    const friendRequest = await this.repository.findById(requestId);
    
    if (!friendRequest) {
      throw AppError.from(ErrFriendRequestNotFound, 404);
    }
    
    // Check if the user is the recipient of the friend request
    if (friendRequest.friendId !== requester.sub) {
      throw AppError.from(ErrUnauthorizedAction, 403);
    }
    
    // Check if the request is in pending status
    if (friendRequest.status !== FriendStatus.PENDING) {
      if (friendRequest.status === FriendStatus.ACCEPTED) {
        throw AppError.from(ErrFriendAlreadyAccepted, 400);
      } else {
        throw AppError.from(ErrFriendRequestNotFound, 404);
      }
    }
    
    // Update the status to accepted
    await this.repository.update(requestId, { status: FriendStatus.ACCEPTED });
    
    return true;
  }
  
  async rejectFriendRequest(requester: Requester, requestId: string): Promise<boolean> {
    const friendRequest = await this.repository.findById(requestId);
    
    if (!friendRequest) {
      throw AppError.from(ErrFriendRequestNotFound, 404);
    }
    
    // Check if the user is the recipient of the friend request
    if (friendRequest.friendId !== requester.sub) {
      throw AppError.from(ErrUnauthorizedAction, 403);
    }
    
    // Check if the request is in pending status
    if (friendRequest.status !== FriendStatus.PENDING) {
      if (friendRequest.status === FriendStatus.REJECTED) {
        throw AppError.from(ErrFriendAlreadyRejected, 400);
      } else {
        throw AppError.from(ErrFriendRequestNotFound, 404);
      }
    }
    
    // Update the status to rejected
    await this.repository.update(requestId, { status: FriendStatus.REJECTED });
    
    return true;
  }
  
  async cancelFriendRequest(requester: Requester, requestId: string): Promise<boolean> {
    const friendRequest = await this.repository.findById(requestId);
    
    if (!friendRequest) {
      throw AppError.from(ErrFriendRequestNotFound, 404);
    }
    
    // Check if the user is the sender of the friend request
    if (friendRequest.userId !== requester.sub) {
      throw AppError.from(ErrUnauthorizedAction, 403);
    }
    
    // Delete the friend request
    await this.repository.delete(requestId, true);
    
    return true;
  }
  
  async removeFriend(requester: Requester, friendId: string): Promise<boolean> {
    // Find the friendship
    const friendship = await this.repository.findFriendRequestBetweenUsers(requester.sub, friendId);
    
    if (!friendship) {
      throw AppError.from(ErrFriendshipNotFound, 404);
    }
    
    // Check if they are actually friends (status is ACCEPTED)
    if (friendship.status !== FriendStatus.ACCEPTED) {
      throw AppError.from(ErrFriendshipNotFound, 404);
    }
    
    // Delete the friendship
    await this.repository.delete(friendship.id, true);
    
    return true;
  }
  
  async getFriendsList(requester: Requester, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    return await this.repository.findFriendsByUserId(requester.sub, paging);
  }
  
  async getFriendsByStatus(requester: Requester, status: FriendStatus, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    // Get friends with the specified status
    const friends = await this.repository.findFriendRequestsByUserIdAndStatus(requester.sub, status);
    
    // Get user details for each friend
    const friendsWithDetails = await Promise.all(
      friends.map(async (friend) => {
        // Determine which ID is the friend's ID (not the requester's ID)
        const friendId = friend.userId === requester.sub ? friend.friendId : friend.userId;
        
        // Get user details from the repository
        const userDetails = await prisma.users.findUnique({ where: { id: friendId } });
        
        if (!userDetails) return null;
        
        return {
          ...friend,
          friend: {
            id: userDetails.id,
            username: userDetails.username,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            avatar: userDetails.avatar
          }
        } as FriendResponseDTO;
      })
    );
    
    // Filter out any null values (in case a user was not found)
    const validFriends = friendsWithDetails.filter(Boolean) as FriendResponseDTO[];
    
    // Apply pagination manually since we're not using the repository's pagination
    const skip = (paging.page - 1) * paging.limit;
    const paginatedFriends = validFriends.slice(skip, skip + paging.limit);
    
    return {
      data: paginatedFriends,
      paging,
      total: validFriends.length
    };
  }
  
  async getAllFriendsWithStatus(requester: Requester, paging: PagingDTO): Promise<{
    pending: FriendResponseDTO[];
    accepted: FriendResponseDTO[];
    rejected: FriendResponseDTO[];
  }> {
    // Get all friends with all statuses
    const pendingFriends = await this.repository.findFriendRequestsByUserIdAndStatus(requester.sub, FriendStatus.PENDING);
    const acceptedFriends = await this.repository.findFriendRequestsByUserIdAndStatus(requester.sub, FriendStatus.ACCEPTED);
    const rejectedFriends = await this.repository.findFriendRequestsByUserIdAndStatus(requester.sub, FriendStatus.REJECTED);
    
    // Helper function to add user details to friend records
    const addUserDetails = async (friends: Friend[]) => {
      const friendsWithDetails = await Promise.all(
        friends.map(async (friend) => {
          // Determine which ID is the friend's ID (not the requester's ID)
          const friendId = friend.userId === requester.sub ? friend.friendId : friend.userId;
          
          // Get user details from the repository
          const userDetails = await prisma.users.findUnique({ where: { id: friendId } });
          
          if (!userDetails) return null;
          
          return {
            ...friend,
            friend: {
              id: userDetails.id,
              username: userDetails.username,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              avatar: userDetails.avatar
            }
          } as FriendResponseDTO;
        })
      );
      
      // Filter out any null values (in case a user was not found)
      return friendsWithDetails.filter(Boolean) as FriendResponseDTO[];
    };
    
    // Process all friend types in parallel
    const [pendingWithDetails, acceptedWithDetails, rejectedWithDetails] = await Promise.all([
      addUserDetails(pendingFriends),
      addUserDetails(acceptedFriends),
      addUserDetails(rejectedFriends)
    ]);
    
    return {
      pending: pendingWithDetails,
      accepted: acceptedWithDetails,
      rejected: rejectedWithDetails
    };
  }
  
  async searchFriends(requester: Requester, searchData: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    const dto = friendSearchDTOSchema.parse(searchData);
    return await this.repository.searchFriendsByNameOrEmail(requester.sub, dto, paging);
  }
  
  async searchNonFriends(requester: Requester, searchData: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    const dto = friendSearchDTOSchema.parse(searchData);
    return await this.repository.searchNonFriendsByNameOrEmail(requester.sub, dto, paging);
  }
  
  async getMutualFriends(requester: Requester, userId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    return await this.repository.findMutualFriends(requester.sub, userId, paging);
  }
  
  // Base CRUD methods required by IUseCase interface
  async getDetail(id: string): Promise<Friend | null> {
    const data = await this.repository.findById(id);
    if (!data) {
      throw ErrNotFound;
    }
    return data;
  }
  
  async update(id: string, data: FriendUpdateDTO): Promise<boolean> {
    const dto = friendUpdateDTOSchema.parse(data);
    const friendRequest = await this.repository.findById(id);
    
    if (!friendRequest) {
      throw ErrNotFound;
    }
    
    await this.repository.update(id, dto);
    return true;
  }
  
  async list(cond: FriendCondDTO, paging: PagingDTO): Promise<Paginated<Friend>> {
    return await this.repository.list(cond, paging);
  }
  
  async delete(id: string): Promise<boolean> {
    const data = await this.repository.findById(id);
    if (!data) {
      throw ErrNotFound;
    }
    
    await this.repository.delete(id, true);
    return true;
  }
  
  async listByIds(ids: string[]): Promise<Friend[]> {
    return await this.repository.listByIds(ids);
  }
}