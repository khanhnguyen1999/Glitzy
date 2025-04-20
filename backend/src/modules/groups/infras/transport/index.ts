import { NextFunction, Request, Response } from 'express';
import { GroupUseCase } from '../../usecase';
import { groupMemberUpdateDTOSchema, groupRequestDTOSchema, groupUpdateDTOSchema } from '../../model';
import { RecommendationService } from '../../service/recommendation-service';
import { validateRequest } from '@shared/utils';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - ownerId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the group
 *         name:
 *           type: string
 *           description: The name of the group
 *         description:
 *           type: string
 *           description: Group description
 *         imageUrl:
 *           type: string
 *           description: URL to the group image
 *         ownerId:
 *           type: string
 *           description: ID of the group owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the group was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the group was last updated
 *     GroupMember:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - groupId
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the group member
 *         userId:
 *           type: string
 *           description: ID of the user
 *         groupId:
 *           type: string
 *           description: ID of the group
 *         role:
 *           type: string
 *           enum: [OWNER, ADMIN, MEMBER]
 *           description: Role of the member in the group
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the member was added
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management API
 */
export class GroupHTTPService {
  private recommendationService: RecommendationService;
  
  constructor(private useCase: GroupUseCase) {
    this.recommendationService = new RecommendationService();
  }

  /**
   * @swagger
   * /v1/groups:
   *   post:
   *     summary: Create a new group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: The group was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Group'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server Error
   */
  // Group endpoints
  async createGroupAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const validatedData = validateRequest(req.body, groupRequestDTOSchema);
      const group = await this.useCase.createGroup(validatedData, userId);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}:
   *   get:
   *     summary: Get group details by ID
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group
   *     responses:
   *       200:
   *         description: Group details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Group'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Group not found
   *       500:
   *         description: Server Error
   */
  async getGroupDetailAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      const group = await this.useCase.getGroupById(groupId, userId);
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}:
   *   put:
   *     summary: Update group information
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: New group name
   *               description:
   *                 type: string
   *                 description: New group description
   *     responses:
   *       200:
   *         description: Group updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Group'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not an owner or admin
   *       404:
   *         description: Group not found
   *       500:
   *         description: Server Error
   */
  async updateGroupAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      const validatedData = validateRequest(req.body, groupUpdateDTOSchema);
      const group = await this.useCase.updateGroup(groupId, validatedData, userId);
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}:
   *   delete:
   *     summary: Delete a group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group to delete
   *     responses:
   *       204:
   *         description: Group deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not the owner
   *       404:
   *         description: Group not found
   *       500:
   *         description: Server Error
   */
  async deleteGroupAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      await this.useCase.deleteGroup(groupId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/user/{userId}:
   *   get:
   *     summary: Get all groups for a user
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     responses:
   *       200:
   *         description: List of user's groups
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Group'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server Error
   */
  async getUserGroupsAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const groups = await this.useCase.getUserGroups(userId);
      res.status(200).json(groups);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}/members:
   *   post:
   *     summary: Add a member to a group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - memberId
   *             properties:
   *               memberId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Member added successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GroupMember'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server Error
   */
  // Group members endpoints
  async addMemberAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      const { memberId } = req.body;
      if (!memberId) {
        res.status(400).json({ message: 'Member ID is required' });
        return;
      }

      const member = await this.useCase.addMember(groupId, memberId, userId);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}/members/{userId}:
   *   delete:
   *     summary: Remove a member from a group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user to remove
   *     responses:
   *       204:
   *         description: Member removed successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not an owner or admin
   *       404:
   *         description: Group or member not found
   *       500:
   *         description: Server Error
   */
  async removeMemberAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      const memberId = req.params.userId;
      await this.useCase.removeMember(groupId, memberId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}/members/{userId}/role:
   *   patch:
   *     summary: Update a member's role in a group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - role
   *             properties:
   *               role:
   *                 type: string
   *                 enum: [OWNER, ADMIN, MEMBER]
   *                 description: New role for the member
   *     responses:
   *       200:
   *         description: Member role updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GroupMember'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not the owner
   *       404:
   *         description: Group or member not found
   *       500:
   *         description: Server Error
   */
  async updateMemberRoleAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      const memberId = req.params.userId;
      const validatedData = validateRequest(req.body, groupMemberUpdateDTOSchema);
      const member = await this.useCase.updateMemberRole(groupId, memberId, validatedData, userId);
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}/members:
   *   get:
   *     summary: Get all members of a group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group
   *     responses:
   *       200:
   *         description: List of group members
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/GroupMember'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not a member of the group
   *       404:
   *         description: Group not found
   *       500:
   *         description: Server Error
   */
  async getGroupMembersAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      const members = await this.useCase.getGroupMembers(groupId, userId);
      res.status(200).json(members);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}/image:
   *   post:
   *     summary: Upload an image for a group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - image
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Image file to upload (JPEG, PNG, or GIF)
   *     responses:
   *       200:
   *         description: Image uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Group'
   *       400:
   *         description: Invalid file type or no file provided
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not an owner or admin
   *       404:
   *         description: Group not found
   *       500:
   *         description: Server Error
   */
  // Group image upload
  configureImageUpload() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'groups');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `group-${uniqueSuffix}${ext}`);
      },
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    });
  }

  async uploadGroupImageAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const groupId = req.params.groupId;
      const imageUrl = `/uploads/groups/${req.file.filename}`;
      const group = await this.useCase.uploadGroupImage(groupId, imageUrl, userId);
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /v1/groups/{groupId}/summary:
   *   get:
   *     summary: Get summary and balance information for a group
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: groupId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the group
   *     responses:
   *       200:
   *         description: Group summary and balance information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 groupId:
   *                   type: string
   *                   description: ID of the group
   *                 totalExpenses:
   *                   type: number
   *                   description: Total expenses in the group
   *                 memberBalances:
   *                   type: array
   *                   description: Balance information for each member
   *                   items:
   *                     type: object
   *                     properties:
   *                       userId:
   *                         type: string
   *                         description: ID of the user
   *                       balance:
   *                         type: number
   *                         description: Current balance for the user
   *                 message:
   *                   type: string
   *                   description: Additional information
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User is not a member of the group
   *       404:
   *         description: Group not found
   *       500:
   *         description: Server Error
   */
  // Optional: Group summary/balance info
  async getGroupSummaryAPI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.requester?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const groupId = req.params.groupId;
      // This would need to be implemented in the useCase, possibly integrating with a expenses/transactions module
      // For now, send a placeholder response
      res.status(200).json({
        groupId,
        totalExpenses: 0,
        memberBalances: [],
        message: 'Group summary feature to be implemented'
      });
    } catch (error) {
      next(error);
    }
  }

    /**
   * Generate travel recommendations for a location
   * This endpoint is used during group creation to suggest places to visit
   */
    async generateRecommendationsAPI(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = res.locals.requester?.sub;
        if (!userId) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
        
        const { location, tripType } = req.body;
        
        if (!location) {
          res.status(400).json({ message: 'Location is required' });
          return;
        }
        
        const recommendations = await this.recommendationService.generateRecommendations(location, tripType);
        res.status(200).json(recommendations);
      } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ 
          message: 'Failed to generate travel recommendations',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    /**
     * @swagger
     * /v1/groups/locations/search:
     *   get:
     *     summary: Search for locations using LocationIQ API
     *     tags: [Groups]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: q
     *         schema:
     *           type: string
     *         required: true
     *         description: Search query string
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         required: false
     *         description: Maximum number of results to return (default 5)
     *     responses:
     *       '200':
     *         description: List of location search results
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   place_id:
     *                     type: string
     *                   osm_id:
     *                     type: string
     *                   display_name:
     *                     type: string
     *                   lat:
     *                     type: string
     *                   lon:
     *                     type: string
     *       '400':
     *         description: Bad request - Missing query parameter
     *       '401':
     *         description: Unauthorized
     *       '500':
     *         description: Server Error
     */
    async searchLocationsAPI(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = res.locals.requester?.sub;
        if (!userId) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
        
        const query = req.query.q as string;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        
        if (!query) {
          res.status(400).json({ message: 'Search query is required' });
          return;
        }
        
        const locations = await this.recommendationService.searchLocations(query, limit);
        res.status(200).json(locations);
      } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({ 
          message: 'Failed to search locations',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
}