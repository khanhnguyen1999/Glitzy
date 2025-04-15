import { ExpenseUseCase } from '@modules/expense/usecase';
import { Balance, Expense, ExpenseDTO } from '@modules/expense/model';
import { jwtProvider } from '@shared/components/jwt';
import { Requester } from '@shared/interface';
import { PagingDTO } from '@shared/model';
import { BaseHttpService } from '@shared/transport/base-http-service';
import { AppError, ErrUnauthorized } from '@shared/utils/error';
import { successResponse } from '@shared/utils/utils';
import { Request, Response } from 'express';

export class ExpenseHTTPService extends BaseHttpService<Expense, ExpenseDTO, Partial<ExpenseDTO>, any> {
  constructor(readonly usecase: ExpenseUseCase) {
    super(usecase);
  }

  /**
   * Create a new expense
   * POST /api/expenses
   */
  async createExpenseAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const expenseData: ExpenseDTO = req.body;
    
    const result = await this.usecase.createExpense(requester, expenseData);
    successResponse(result, res);
  }

  /**
   * Get a specific expense by ID
   * GET /api/expenses/:expenseId
   */
  async getExpenseAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const expenseId = req.params.expenseId;
    
    const result = await this.usecase.getExpense(requester, expenseId);
    successResponse(result, res);
  }

  /**
   * Get all expenses for a group
   * GET /api/expenses/group/:groupId
   */
  async getGroupExpensesAPI(req: Request, res: Response) {
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
    const limit = parseInt(req.query.limit as string) || 10;
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getGroupExpenses(requester, groupId, paging);
    successResponse(result, res);
  }

  /**
   * Get all expenses for a user
   * GET /api/expenses/user/:userId
   */
  async getUserExpensesAPI(req: Request, res: Response) {
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
    const limit = parseInt(req.query.limit as string) || 10;
    
    const paging: PagingDTO = { page, limit };
    const result = await this.usecase.getUserExpenses(requester, userId, paging);
    successResponse(result, res);
  }

  /**
   * Update an existing expense
   * PUT /api/expenses/:expenseId
   */
  async updateExpenseAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const expenseId = req.params.expenseId;
    const expenseData: Partial<ExpenseDTO> = req.body;
    
    const result = await this.usecase.updateExpense(requester, expenseId, expenseData);
    successResponse(result, res);
  }

  /**
   * Delete an expense
   * DELETE /api/expenses/:expenseId
   */
  async deleteExpenseAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);
    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;
    const expenseId = req.params.expenseId;
    
    const result = await this.usecase.deleteExpense(requester, expenseId);
    successResponse({ success: result }, res);
  }

  /**
   * Get balances for a group
   * GET /api/expenses/group/:groupId/balances
   */
  async getGroupBalancesAPI(req: Request, res: Response) {
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
    
    const result = await this.usecase.getGroupBalances(requester, groupId);
    successResponse(result, res);
  }
}