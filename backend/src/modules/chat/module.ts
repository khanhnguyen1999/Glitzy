import { Router } from 'express';
import { Server } from 'socket.io';
import { PrismaChatCommandRepository, PrismaChatQueryRepository, PrismaChatRepository } from './infras/repository';
import { ChatHTTPService } from './infras/transport';
import { ChatSocketService } from './infras/transport/socket';
import { ChatUseCase } from './usecase';
import { authMiddleware } from '@shared/middleware/auth';
import { jwtProvider } from '@shared/components/jwt';
import { JwtTokenIntrospectAdapter } from '@shared/components/jwt-adapter';

export const initChatModule = (io: Server) => {
  // Initialize repositories
  const queryRepository = new PrismaChatQueryRepository();
  const commandRepository = new PrismaChatCommandRepository();
  const repository = new PrismaChatRepository(queryRepository, commandRepository);
  
  // Initialize use case
  const useCase = new ChatUseCase(repository);
  
  // Initialize HTTP service
  const httpService = new ChatHTTPService(useCase);
  
  // Initialize Socket.IO service
  new ChatSocketService(io, useCase);
  
  // Set up routes
  const router = Router();
  
  // Apply authentication middleware to all routes
  const jwtAdapter = new JwtTokenIntrospectAdapter(jwtProvider);
  router.use(authMiddleware(jwtAdapter));
  
  // Define routes
  router.get('/private/:userId', httpService.getPrivateChatHistoryAPI.bind(httpService));
  router.get('/group/:groupId', httpService.getGroupChatHistoryAPI.bind(httpService));
  router.post('/message', httpService.storeMessageAPI.bind(httpService));
  
  return router;
};