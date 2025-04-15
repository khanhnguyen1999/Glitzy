import { IChatUseCase } from '@modules/chat/interface';
import { ChatMessage, ChatMessageDTO } from '@modules/chat/model';
import { jwtProvider } from '@shared/components/jwt';
import { Requester } from '@shared/interface';
import { PagingDTO } from '@shared/model';
import { BaseHttpService } from '@shared/transport/base-http-service';
import { ErrUnauthorized } from '@shared/utils/error';
import { successResponse } from '@shared/utils/utils';
import { Request, Response } from 'express';

export class ChatHTTPService {
  constructor(readonly usecase: IChatUseCase) {}

  /**
   * @swagger
   * /v1/chat/private/{userId}:
   *   get:
   *     summary: Get private chat history with a user
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user to get chat history with
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of messages per page
   *     responses:
   *       200:
   *         description: Chat history retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ChatMessage'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     pages:
   *                       type: integer
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   *       500:
   *         description: Server Error
   */
  async getPrivateChatHistoryAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getPrivateChatHistory(requester, userId, paging);
    
    successResponse(result, res);
  }

  /**
   * @swagger
   * /v1/chat/group/{groupId}:
   *   get:
   *     summary: Get group chat history
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group to get chat history for
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of messages per page
   *     responses:
   *       200:
   *         description: Group chat history retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ChatMessage'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     pages:
   *                       type: integer
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not a member of the group
   *       404:
   *         description: Group not found
   *       500:
   *         description: Server Error
   */
  async getGroupChatHistoryAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const groupId = req.params.groupId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getGroupChatHistory(requester, groupId, paging);
    
    successResponse(result, res);
  }

  /**
   * @swagger
   * /v1/chat/message:
   *   post:
   *     summary: Store a message manually (fallback)
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - roomId
   *               - content
   *             properties:
   *               roomId:
   *                 type: string
   *                 description: ID of the chat room
   *               content:
   *                 type: string
   *                 description: Message content
   *     responses:
   *       201:
   *         description: Message stored successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ChatMessage'
   *       400:
   *         description: Invalid request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not allowed to send messages to this room
   *       404:
   *         description: Chat room not found
   *       500:
   *         description: Server Error
   */
  async storeMessageAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const { roomId, content } = req.body;
    
    const messageData: ChatMessageDTO = {
      roomId,
      senderId: requester.sub,
      content
    };
    
    const result = await this.usecase.sendMessage(requester, messageData);
    
    res.status(201).json(result);
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       required:
 *         - id
 *         - roomId
 *         - senderId
 *         - content
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the message
 *         roomId:
 *           type: string
 *           description: ID of the chat room
 *         senderId:
 *           type: string
 *           description: ID of the message sender
 *         content:
 *           type: string
 *           description: Message content
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the message was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the message was last updated
 *         isRead:
 *           type: boolean
 *           description: Whether the message has been read
 *         senderInfo:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: User ID
 *             firstName:
 *               type: string
 *               description: User first name
 *             lastName:
 *               type: string
 *               description: User last name
 *             avatar:
 *               type: string
 *               description: User avatar URL
 *     ChatRoom:
 *       type: object
 *       required:
 *         - id
 *         - creatorId
 *         - receiverId
 *         - type
 *         - status
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the chat room
 *         creatorId:
 *           type: string
 *           description: ID of the user who created the room
 *         receiverId:
 *           type: string
 *           description: ID of the receiver (user ID for direct chats, group ID for group chats)
 *         type:
 *           type: string
 *           enum: [direct, group]
 *           description: Type of chat room
 *         status:
 *           type: string
 *           enum: [pending, active, deleted]
 *           description: Status of the chat room
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the room was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the room was last updated
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The date the room was deleted (if applicable)
 *         lastMessage:
 *           $ref: '#/components/schemas/ChatMessage'
 *         unreadCount:
 *           type: integer
 *           description: Number of unread messages in the room
 */
