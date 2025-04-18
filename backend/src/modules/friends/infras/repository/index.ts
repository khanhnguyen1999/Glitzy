import { IFriendCommandRepository, IFriendQueryRepository } from "@modules/friends/interface";
import { Friend, FriendCondDTO, FriendResponseDTO, FriendSearchDTO, FriendStatus, FriendUpdateDTO } from "@modules/friends/model";
import prisma from "@shared/components/prisma";
import { ICommandRepository, IQueryRepository, IRepository } from "@shared/interface";
import { Paginated, PagingDTO } from "@shared/model";
import { v7 } from 'uuid';

export class PrismaFriendRepository implements IRepository<Friend, FriendCondDTO, FriendUpdateDTO> {
  constructor(
    private readonly queryRepository: IFriendQueryRepository,
    private readonly commandRepository: IFriendCommandRepository
  ) {}

  async findById(id: string): Promise<Friend | null> {
    return await this.queryRepository.findById(id);
  }

  async findByCond(condition: FriendCondDTO): Promise<Friend | null> {
    return await this.queryRepository.findByCond(condition);
  }

  async list(cond: FriendCondDTO, paging: PagingDTO): Promise<Paginated<Friend>> {
    return await this.queryRepository.list(cond, paging);
  }

  async listByIds(ids: string[]): Promise<Friend[]> {
    return await this.queryRepository.listByIds(ids);
  }

  async insert(data: Friend): Promise<boolean> {
    return await this.commandRepository.insert(data);
  }

  async update(id: string, data: FriendUpdateDTO): Promise<boolean> {
    return await this.commandRepository.update(id, data);
  }

  async delete(id: string, isHard: boolean): Promise<boolean> {
    return await this.commandRepository.delete(id, isHard);
  }
  
  // Delegate to specific repository methods
  async findFriendRequestsByUserIdAndStatus(userId: string, status: string): Promise<Friend[]> {
    return await this.queryRepository.findFriendRequestsByUserIdAndStatus(userId, status);
  }
  
  async findFriendRequestBetweenUsers(userId: string, friendId: string): Promise<Friend | null> {
    return await this.queryRepository.findFriendRequestBetweenUsers(userId, friendId);
  }
  
  async findFriendsByUserId(userId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    return await this.queryRepository.findFriendsByUserId(userId, paging);
  }
  
  async searchFriendsByNameOrEmail(userId: string, query: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    return await this.queryRepository.searchFriendsByNameOrEmail(userId, query, paging);
  }
  
  async findMutualFriends(userId: string, otherUserId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    return await this.queryRepository.findMutualFriends(userId, otherUserId, paging);
  }
  
  async searchNonFriendsByNameOrEmail(userId: string, query: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    return await this.queryRepository.searchNonFriendsByNameOrEmail(userId, query, paging);
  }
}

export class PrismaFriendCommandRepository implements IFriendCommandRepository {
  async insert(data: Friend): Promise<boolean> {
    await prisma.friends.create({ data });
    return true;
  }

  async update(id: string, data: FriendUpdateDTO): Promise<boolean> {
    await prisma.friends.update({ where: { id }, data });
    return true;
  }

  async delete(id: string, isHard: boolean): Promise<boolean> {
    if (isHard) {
      await prisma.friends.delete({ where: { id } });
    } else {
      // Soft delete not implemented for friends, so we'll just delete
      await prisma.friends.delete({ where: { id } });
    }
    return true;
  }
}

export class PrismaFriendQueryRepository implements IFriendQueryRepository {
  async findById(id: string): Promise<Friend | null> {
    const data = await prisma.friends.findUnique({ where: { id } });
    if (!data) return null;
    
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      status: data.status as FriendStatus
    } as Friend;
  }
  
  async findByCond(condition: FriendCondDTO): Promise<Friend | null> {
    const data = await prisma.friends.findFirst({ where: condition });
    if (!data) return null;
    
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      status: data.status as FriendStatus
    } as Friend;
  }
  
  async list(cond: FriendCondDTO, paging: PagingDTO): Promise<Paginated<Friend>> {
    const total = await prisma.friends.count({ where: cond });
    const skip = (paging.page - 1) * paging.limit;

    const items = await prisma.friends.findMany({
      where: cond,
      take: paging.limit,
      skip,
      orderBy: { createdAt: 'desc' }
    });

    return {
      data: items.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        status: item.status as FriendStatus
      })) as Friend[],
      paging,
      total
    };
  }
  
  async listByIds(ids: string[]): Promise<Friend[]> {
    const data = await prisma.friends.findMany({ where: { id: { in: ids } } });
    return data.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      status: item.status as FriendStatus
    })) as Friend[];
  }
  
  async findFriendRequestsByUserIdAndStatus(userId: string, status: FriendStatus): Promise<Friend[]> {
    const data = await prisma.friends.findMany({
      where: {
        OR: [
          { userId, status },
          { friendId: userId, status }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return data.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      status: item.status as FriendStatus
    })) as Friend[];
  }
  
  async findFriendRequestBetweenUsers(userId: string, friendId: string): Promise<Friend | null> {
    const data = await prisma.friends.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });
    
    if (!data) return null;
    
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      status: data.status as FriendStatus
    } as Friend;
  }
  
  async findFriendsByUserId(userId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    const skip = (paging.page - 1) * paging.limit;
    
    // Count total accepted friends
    const total = await prisma.friends.count({
      where: {
        OR: [
          { userId, status: FriendStatus.ACCEPTED },
          { friendId: userId, status: FriendStatus.ACCEPTED }
        ]
      }
    });
    
    // Get friends with user details
    const friendships = await prisma.friends.findMany({
      where: {
        OR: [
          { userId, status: FriendStatus.ACCEPTED },
          { friendId: userId, status: FriendStatus.ACCEPTED }
        ]
      },
      take: paging.limit,
      skip,
      orderBy: { createdAt: 'desc' }
    });
    
    // Fetch user details for each friend
    const friendsWithDetails = await Promise.all(friendships.map(async (friendship: any) => {
      const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
      const friendUser = await prisma.users.findUnique({ where: { id: friendId } });
      
      if (!friendUser) return null;
      
      return {
        ...friendship,
        createdAt: new Date(friendship.createdAt),
        status: friendship.status as FriendStatus,
        friend: {
          id: friendUser.id,
          username: friendUser.username,
          firstName: friendUser.firstName,
          lastName: friendUser.lastName,
          avatar: friendUser.avatar
        }
      } as FriendResponseDTO;
    }));
    
    return {
      data: friendsWithDetails.filter(Boolean) as FriendResponseDTO[],
      paging,
      total
    };
  }
  
  async searchFriendsByNameOrEmail(userId: string, query: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    const skip = (paging.page - 1) * paging.limit;
    
    // First get all friend IDs for the user
    const friendships = await prisma.friends.findMany({
      where: {
        OR: [
          { userId, status: FriendStatus.ACCEPTED },
          { friendId: userId, status: FriendStatus.ACCEPTED }
        ]
      }
    });
    
    // Extract friend IDs
    const friendIds = friendships.map((f: any) => 
      f.userId === userId ? f.friendId : f.userId
    );
    
    // Build search condition
    const searchCondition: any = {
      id: { in: friendIds }
    };
    
    if (query.name) {
      searchCondition.OR = [
        { firstName: { contains: query.name } },
        { lastName: { contains: query.name } },
        { username: { contains: query.name } }
      ];
    }
    
    if (query.email) {
      if (!searchCondition.OR) searchCondition.OR = [];
      searchCondition.OR.push({ username: { contains: query.email } });
    }
    
    // Count total matching friends
    const total = await prisma.users.count({ where: searchCondition });
    
    // Get matching friends
    const matchingUsers = await prisma.users.findMany({
      where: searchCondition,
      take: paging.limit,
      skip,
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to response format
    const result = matchingUsers.map((user: any) => {
      const friendship = friendships.find((f: any) => 
        (f.userId === userId && f.friendId === user.id) || 
        (f.friendId === userId && f.userId === user.id)
      );
      
      if (!friendship) return null;
      
      return {
        ...friendship,
        createdAt: new Date(friendship.createdAt),
        status: friendship.status as FriendStatus,
        friend: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        }
      } as FriendResponseDTO;
    });
    
    return {
      data: result.filter(Boolean) as FriendResponseDTO[],
      paging,
      total
    };
  }
  
  async searchNonFriendsByNameOrEmail(userId: string, query: FriendSearchDTO, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    const skip = (paging.page - 1) * paging.limit;
    
    // First get all friend IDs for the user (including pending requests)
    const friendships = await prisma.friends.findMany({
      where: {
        OR: [
          { userId },
          { friendId: userId }
        ]
      }
    });
    
    // Extract all user IDs that have any relationship with the current user
    const relatedUserIds = friendships.map((f: any) => 
      f.userId === userId ? f.friendId : f.userId
    );
    
    // Add the user's own ID to exclude from results
    relatedUserIds.push(userId);
    
    // Build search condition to find users who are NOT friends
    const searchCondition: any = {
      id: { notIn: relatedUserIds }
    };
    
    if (query.name) {
      searchCondition.OR = [
        { firstName: { contains: query.name } },
        { lastName: { contains: query.name } },
        { username: { contains: query.name } }
      ];
    }
    
    if (query.email) {
      if (!searchCondition.OR) searchCondition.OR = [];
      searchCondition.OR.push({ username: { contains: query.email } });
    }
    
    // Count total matching non-friends
    const total = await prisma.users.count({ where: searchCondition });
    
    // Get matching non-friends
    const matchingUsers = await prisma.users.findMany({
      where: searchCondition,
      take: paging.limit,
      skip,
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to response format
    const result = matchingUsers.map((user: any) => {
      // Create a response object without directly using the database schema
      // This is a virtual representation, not stored in the database
      return {
        id: v7(), // Generate a placeholder ID for the response
        userId,
        friendId: user.id,
        // Use type assertion to bypass the type checking
        // since this is just for display purposes and won't be stored in DB
        status: 'none' as any, 
        createdAt: new Date(),
        friend: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        }
      } as FriendResponseDTO;
    });
    
    return {
      data: result,
      paging,
      total
    };
  }
  
  async findMutualFriends(userId: string, otherUserId: string, paging: PagingDTO): Promise<Paginated<FriendResponseDTO>> {
    const skip = (paging.page - 1) * paging.limit;
    
    // Get user1's friends
    const user1Friendships = await prisma.friends.findMany({
      where: {
        OR: [
          { userId, status: FriendStatus.ACCEPTED },
          { friendId: userId, status: FriendStatus.ACCEPTED }
        ]
      }
    });
    
    const user1FriendIds = user1Friendships.map((f: any) => 
      f.userId === userId ? f.friendId : f.userId
    );
    
    // Get user2's friends
    const user2Friendships = await prisma.friends.findMany({
      where: {
        OR: [
          { userId: otherUserId, status: FriendStatus.ACCEPTED },
          { friendId: otherUserId, status: FriendStatus.ACCEPTED }
        ]
      }
    });
    
    const user2FriendIds = user2Friendships.map((f: any) => 
      f.userId === otherUserId ? f.friendId : f.userId
    );
    
    // Find mutual friend IDs
    const mutualFriendIds = user1FriendIds.filter((id: any) => user2FriendIds.includes(id));
    
    // Count total mutual friends
    const total = mutualFriendIds.length;
    
    // Apply pagination
    const paginatedMutualFriendIds = mutualFriendIds.slice(skip, skip + paging.limit);
    
    // Get user details for mutual friends
    const mutualFriends = await Promise.all(paginatedMutualFriendIds.map(async (friendId: any) => {
      const user = await prisma.users.findUnique({ where: { id: friendId } });
      const friendship = user1Friendships.find((f: any) => 
        (f.userId === userId && f.friendId === friendId) || 
        (f.friendId === userId && f.userId === friendId)
      );
      
      if (!user || !friendship) return null;
      
      return {
        ...friendship,
        createdAt: new Date(friendship.createdAt),
        status: friendship.status as FriendStatus,
        friend: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        }
      } as FriendResponseDTO;
    }));
    
    return {
      data: mutualFriends.filter(Boolean) as FriendResponseDTO[],
      paging,
      total
    };
  }
  
  // These methods are required by IRepository interface but shouldn't be used in a query repository
  // They're implemented here to satisfy the interface requirements
  async insert(data: Friend): Promise<boolean> {
    throw new Error('Method not implemented: insert should be called on command repository');
  }

  async update(id: string, data: FriendUpdateDTO): Promise<boolean> {
    throw new Error('Method not implemented: update should be called on command repository');
  }

  async delete(id: string, isHard: boolean): Promise<boolean> {
    throw new Error('Method not implemented: delete should be called on command repository');
  }
}