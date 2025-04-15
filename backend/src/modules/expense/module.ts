import { ServiceContext } from '@shared/interface';
import { Router } from 'express';
import { ExpenseHTTPService } from './infras/transport';
import { ExpenseUseCase } from './usecase';
import { PrismaExpenseCommandRepository, PrismaExpenseQueryRepository, PrismaExpenseRepository } from './infras/repository';

export const setupExpenseModule = (sctx: ServiceContext) => {
  const queryRepository = new PrismaExpenseQueryRepository();
  const commandRepository = new PrismaExpenseCommandRepository();
  const repository = new PrismaExpenseRepository(queryRepository, commandRepository);
  const useCase = new ExpenseUseCase(repository);
  const httpService = new ExpenseHTTPService(useCase);

  const router = Router();
  const mdlFactory = sctx.mdlFactory;

  // Create a new expense
  router.post('/', mdlFactory.auth, httpService.createExpenseAPI.bind(httpService));
  
  // Get all expenses for a group
  router.get('/group/:groupId', mdlFactory.auth, httpService.getGroupExpensesAPI.bind(httpService));
  
  // Get simplified balances for a group
  router.get('/group/:groupId/balances', mdlFactory.auth, httpService.getGroupBalancesAPI.bind(httpService));
  
  // Get all expenses for a user
  router.get('/user/:userId', mdlFactory.auth, httpService.getUserExpensesAPI.bind(httpService));
  
  // Get, update, or delete a specific expense
  router.get('/:expenseId', mdlFactory.auth, httpService.getExpenseAPI.bind(httpService));
  router.put('/:expenseId', mdlFactory.auth, httpService.updateExpenseAPI.bind(httpService));
  router.delete('/:expenseId', mdlFactory.auth, httpService.deleteExpenseAPI.bind(httpService));
  
  return router;
};