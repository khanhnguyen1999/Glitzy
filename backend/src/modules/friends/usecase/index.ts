import { IFriendQueryRepository, IFriendUseCase } from '@modules/friends/interface';
import { Friend, FriendCondDTO, FriendRequestDTO, friendRequestDTOSchema, FriendResponseDTO, FriendSearchDTO, friendSearchDTOSchema, FriendStatus, FriendUpdateDTO, friendUpdateDTOSchema } from '@modules/friends/model';
import { ErrCannotSendRequestToSelf, ErrFriendAlreadyAccepted, ErrFriendAlreadyRejected, ErrFriendRequestAlreadyExists, ErrFriendRequestNotFound, ErrFriendshipNotFound, ErrUnauthorizedAction, ErrUserNotFound } from '@modules/friends/model/error';
import { Requester, UserRole } from '@shared/interface';
import { Paginated, PagingDTO } from '@shared/model';
import { AppError, ErrNotFound } from '@shared/utils/error';
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
      throw AppError.from(ErrFriendRequestAlreadyExists, 400);
    }
    
    // Create new friend request
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
  
  async searchFriends(requester: Requester, searchData: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    const dto = friendSearchDTOSchema.parse(searchData);
    return await this.repository.searchFriendsByNameOrEmail(requester.sub, dto, paging);
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