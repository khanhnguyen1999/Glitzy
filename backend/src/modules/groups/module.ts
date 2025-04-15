import { ServiceContext } from '@shared/interface';
import { Router } from 'express';

import { PrismaGroupCommandRepository, PrismaGroupMemberCommandRepository, PrismaGroupMemberQueryRepository, PrismaGroupQueryRepository, PrismaGroupRepository } from './infras/repository';
import { GroupHTTPService } from './infras/transport';
import { GroupUseCase } from './usecase';

export const setupGroupsModule = (sctx: ServiceContext) => {
  const groupQueryRepository = new PrismaGroupQueryRepository();
  const groupCommandRepository = new PrismaGroupCommandRepository();
  const groupMemberQueryRepository = new PrismaGroupMemberQueryRepository();
  const groupMemberCommandRepository = new PrismaGroupMemberCommandRepository();
  

  const repository = new PrismaGroupRepository(
    groupQueryRepository,
    groupCommandRepository,
    groupMemberQueryRepository,
    groupMemberCommandRepository
  );
  const useCase = new GroupUseCase(repository);
  const httpService = new GroupHTTPService(useCase);
  
  const router = Router();
  const mdlFactory = sctx.mdlFactory;
  const upload = httpService.configureImageUpload();

  // Group endpoints
  router.post('/', mdlFactory.auth, httpService.createGroupAPI.bind(httpService));
  // Special route for getting user groups - needs to be before /:groupId routes to avoid conflicts
  router.get('/user/:userId', mdlFactory.auth, httpService.getUserGroupsAPI.bind(httpService));
  router.get('/:groupId', mdlFactory.auth, httpService.getGroupDetailAPI.bind(httpService));
  router.put('/:groupId', mdlFactory.auth, httpService.updateGroupAPI.bind(httpService));
  router.delete('/:groupId', mdlFactory.auth, httpService.deleteGroupAPI.bind(httpService));

  // Group members endpoints
  router.post('/:groupId/members', mdlFactory.auth, httpService.addMemberAPI.bind(httpService));
  router.delete('/:groupId/members/:userId', mdlFactory.auth, httpService.removeMemberAPI.bind(httpService));
  router.patch('/:groupId/members/:userId/role', mdlFactory.auth, httpService.updateMemberRoleAPI.bind(httpService));
  router.get('/:groupId/members', mdlFactory.auth, httpService.getGroupMembersAPI.bind(httpService));

  // Group image upload
  router.post('/:groupId/image', mdlFactory.auth, upload.single('image'), httpService.uploadGroupImageAPI.bind(httpService));

  // Optional: Group summary/balance info
  router.get('/:groupId/summary', mdlFactory.auth, httpService.getGroupSummaryAPI.bind(httpService));

  return router;
};