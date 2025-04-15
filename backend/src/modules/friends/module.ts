import { ServiceContext, UserRole } from '@shared/interface';
import { Router } from 'express';

import { PrismaFriendCommandRepository, PrismaFriendQueryRepository, PrismaFriendRepository } from './infras/repository';
import { FriendHTTPService } from './infras/transport';
import { FriendUseCase } from './usecase';

export const setupFriendsModule = (sctx: ServiceContext) => {
  const queryRepository = new PrismaFriendQueryRepository();
  const commandRepository = new PrismaFriendCommandRepository();

  const repository = new PrismaFriendRepository(queryRepository, commandRepository);
  const useCase = new FriendUseCase(repository);
  const httpService = new FriendHTTPService(useCase);

  const router = Router();
  const mdlFactory = sctx.mdlFactory;

  router.post('/request', mdlFactory.auth, httpService.sendFriendRequestAPI.bind(httpService));
  router.post('/accept/:id', mdlFactory.auth, httpService.acceptFriendRequestAPI.bind(httpService));
  router.post('/reject/:id', mdlFactory.auth, httpService.rejectFriendRequestAPI.bind(httpService));
  router.post('/cancel/:id', mdlFactory.auth, httpService.cancelFriendRequestAPI.bind(httpService));
  router.get('/', mdlFactory.auth, httpService.getFriendsListAPI.bind(httpService));
  router.get('/search', mdlFactory.auth, httpService.searchFriendsAPI.bind(httpService));
  router.get('/mutual/:id', mdlFactory.auth, httpService.getMutualFriendsAPI.bind(httpService));
  router.delete('/:id', mdlFactory.auth, httpService.removeFriendAPI.bind(httpService));
  return router;
};