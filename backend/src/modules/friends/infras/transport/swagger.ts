/**
 * @swagger
 * components:
 *   schemas:
 *     Friend:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - friendId
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the friendship
 *         userId:
 *           type: string
 *           description: ID of the user who initiated the friendship
 *         friendId:
 *           type: string
 *           description: ID of the friend
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *           description: Status of the friendship
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the friendship was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the friendship was last updated
 *     FriendRequest:
 *       type: object
 *       required:
 *         - friendId
 *       properties:
 *         friendId:
 *           type: string
 *           description: ID of the user to send friend request to
 *     FriendResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the friendship
 *     FriendSuccess:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *     FriendsList:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID
 *               email:
 *                 type: string
 *                 description: User email
 *               firstName:
 *                 type: string
 *                 description: User first name
 *               lastName:
 *                 type: string
 *                 description: User last name
 *               username:
 *                 type: string
 *                 description: User display name
 *               avatarUrl:
 *                 type: string
 *                 description: User avatar URL
 *               friendshipId:
 *                 type: string
 *                 description: ID of the friendship
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACCEPTED, REJECTED]
 *                 description: Status of the friendship
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of items
 *             page:
 *               type: integer
 *               description: Current page number
 *             limit:
 *               type: integer
 *               description: Number of items per page
 *             pages:
 *               type: integer
 *               description: Total number of pages
 */

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management API
 */

/**
 * @swagger
 * /v1/friends/status/pending:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FriendRequest'
 *     responses:
 *       200:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Friend request already exists
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /v1/friends/accept/{id}:
 *   post:
 *     summary: Accept a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the friend request
 *     responses:
 *       200:
 *         description: Friend request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendSuccess'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the recipient of the request
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /v1/friends/reject/{id}:
 *   post:
 *     summary: Reject a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the friend request
 *     responses:
 *       200:
 *         description: Friend request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendSuccess'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the recipient of the request
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /v1/friends/cancel/{id}:
 *   post:
 *     summary: Cancel a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the friend request
 *     responses:
 *       200:
 *         description: Friend request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendSuccess'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the sender of the request
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /v1/friends:
 *   get:
 *     summary: Get list of friends
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of friends
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendsList'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /v1/friends/search:
 *   get:
 *     summary: Search friends by name or email
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name to search for
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email to search for
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendsList'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /v1/friends/mutual/{id}:
 *   get:
 *     summary: Get mutual friends with another user
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to find mutual friends with
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of mutual friends
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendsList'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /v1/friends/{id}:
 *   delete:
 *     summary: Remove a friend
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the friend to remove
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendSuccess'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server Error
 */
