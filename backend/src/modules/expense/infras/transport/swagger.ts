/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management
 */

/**
 * @swagger
 * /api/v1/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - paidById
 *               - splitWith
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: The expense title
 *               amount:
 *                 type: number
 *                 description: The expense amount
 *               paidById:
 *                 type: string
 *                 description: ID of the user who paid
 *               splitWith:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *               groupId:
 *                 type: string
 *                 description: Group ID if this is a group expense
 *               category:
 *                 type: string
 *                 enum: [food, transportation, housing, utilities, entertainment, shopping, health, travel, education, other]
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/expenses/group/{groupId}:
 *   get:
 *     summary: Get all expenses in a specific group
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
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
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */

/**
 * @swagger
 * /api/v1/expenses/user/{userId}:
 *   get:
 *     summary: Get all expenses involving a specific user
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
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
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/expenses/{expenseId}:
 *   get:
 *     summary: Get details of a specific expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *   put:
 *     summary: Update an existing expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               paidById:
 *                 type: string
 *               splitWith:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *               category:
 *                 type: string
 *                 enum: [food, transportation, housing, utilities, entertainment, shopping, health, travel, education, other]
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */

/**
 * @swagger
 * /api/v1/expenses/group/{groupId}/balances:
 *   get:
 *     summary: Get simplified balances for a group
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group balances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balances:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       balance:
 *                         type: number
 *                       currency:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         amount:
 *           type: number
 *         paidById:
 *           type: string
 *         paidByInfo:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             avatar:
 *               type: string
 *         splitWith:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               userInfo:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   avatar:
 *                     type: string
 *         groupId:
 *           type: string
 *           nullable: true
 *         groupInfo:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             image:
 *               type: string
 *         category:
 *           type: string
 *           enum: [food, transportation, housing, utilities, entertainment, shopping, health, travel, education, other]
 *         date:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         pages:
 *           type: integer
 */