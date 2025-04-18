import { IFriendUseCase } from '@modules/friends/interface';
import { Friend, FriendCondDTO, FriendRequestDTO, FriendResponseDTO, FriendSearchDTO, FriendStatus, FriendUpdateDTO } from '@modules/friends/model';
import { jwtProvider } from '@shared/components/jwt';
import { Requester } from '@shared/interface';
import { PagingDTO } from '@shared/model';
import { BaseHttpService } from '@shared/transport/base-http-service';
import { ErrNotFound, ErrUnauthorized } from '@shared/utils/error';
import { successResponse } from '@shared/utils/utils';
import { Request, Response } from 'express';

export class FriendHTTPService extends BaseHttpService<Friend, FriendRequestDTO, FriendUpdateDTO, FriendCondDTO> {
  constructor(readonly usecase: IFriendUseCase) {
    super(usecase);
  }

  /**
   * Send a friend request
   * POST /api/friends/request
   */
  async sendFriendRequestAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const friendId = req.body.friendId;
    
    const result = await this.usecase.sendFriendRequest(requester, { friendId });
    successResponse({ id: result }, res);
  }

  /**
   * Accept a friend request
   * POST /api/friends/accept/:id
   */
  async acceptFriendRequestAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const requestId = req.params.id;
    
    const result = await this.usecase.acceptFriendRequest(requester, requestId);
    successResponse({ success: result }, res);
  }

  /**
   * Reject a friend request
   * POST /api/friends/reject/:id
   */
  async rejectFriendRequestAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const requestId = req.params.id;
    
    const result = await this.usecase.rejectFriendRequest(requester, requestId);
    successResponse({ success: result }, res);
  }

  /**
   * Cancel a friend request
   * POST /api/friends/cancel/:id
   */
  async cancelFriendRequestAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const requestId = req.params.id;
    
    const result = await this.usecase.cancelFriendRequest(requester, requestId);
    successResponse({ success: result }, res);
  }

  /**
   * Get list of friends
   * GET /api/friends
   */
  async getFriendsListAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getFriendsList(requester, paging);
    successResponse(result, res);
  }
  
  /**
   * Get friends by status
   * GET /api/friends/status/:status
   */
  async getFriendsByStatusAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const status = req.params.status as FriendStatus;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = requester.sub;
    
    // Validate status parameter
    if (!Object.values(FriendStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${Object.values(FriendStatus).join(', ')}`);
    }
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getFriendsByStatus(requester, status, paging);
    
    // Filter out any records where the user is both the requester and the friend
    if (result.data) {
      result.data = result.data.filter(friend => {
        // Exclude cases where userId equals friendId (user is friends with themselves)
        return friend.userId !== userId;
      });
      // Update total count after filtering
      result.total = result.data.length;
    }
    
    successResponse(result, res);
  }
  
  /**
   * Get all friends with their statuses (pending, accepted, rejected)
   * GET /api/friends/all-with-status
   */
  async getAllFriendsWithStatusAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getAllFriendsWithStatus(requester, paging);
    successResponse(result, res);
  }

  /**
   * Search friends by name or email
   * GET /api/friends/search
   */
  async searchFriendsAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const searchData: FriendSearchDTO = {
      name: req.query.name as string,
      email: req.query.email as string
    };
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.searchFriends(requester, searchData, paging);
    successResponse(result, res);
  }

  /**
   * Get mutual friends
   * GET /api/friends/mutual/:id
   */
  async getMutualFriendsAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getMutualFriends(requester, userId, paging);
    successResponse(result, res);
  }

  /**
   * Remove a friend
   * DELETE /api/friends/:id
   */
  async removeFriendAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const friendId = req.params.id;
    
    const result = await this.usecase.removeFriend(requester, friendId);
    successResponse({ success: result }, res);
  }

  /**
   * Search for users who are not friends
   * GET /api/friends/users/search/non-friends
   */
  async searchNonFriendsAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const searchData: FriendSearchDTO = {
      name: req.query.query as string,
    };
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.searchNonFriends(requester, searchData, paging);
    successResponse(result, res);
  }
}