import 'module-alias/register';

import { setupUserConsumer, setupUserModule } from '@modules/user/module';
import { setupFriendsModule } from '@modules/friends/module';
import { setupGroupsModule } from '@modules/groups/module';
import { initChatModule } from '@modules/chat/module';
import { config } from '@shared/components/config';
import prisma from '@shared/components/prisma';
import { ServiceContext } from '@shared/interface';
import { responseErr } from '@shared/utils/error';
import Logger from '@shared/utils/logger';
import { TokenIntrospectRPCClient } from '@shared/rpc/verify-token';
import { RedisClient } from '@shared/components/redis-pubsub/redis';
import { NextFunction, Request, Response, static as serveStatic } from 'express';
import { createServer } from 'http';
import path from 'path';
import app from './app';
import { setupMiddlewares } from './shared/middleware';
import { swaggerUi, swaggerSpec } from './swagger';
import { Server as SocketIOServer } from 'socket.io';
import { setupExpenseModule } from '@modules/expense/module';
import { MessageModule } from '@modules/message/module';

async function bootServer(port: number) {
  Logger.info(`Starting server in ${config.envName} mode...`);

  try {
    const introspector = new TokenIntrospectRPCClient(config.rpc.introspectUrl);
    const MdlFactory = setupMiddlewares(introspector);

    const connectionUrl = config.redis.url as string;
    await RedisClient.init(connectionUrl);

    await prisma.$connect();
    Logger.success('Prisma connected to database');

    // error handling
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      responseErr(err, res);
      return next();
    });

    const serviceCtx: ServiceContext = {
      mdlFactory: MdlFactory,
      eventPublisher: RedisClient.getInstance(),
    };

    const userModule = setupUserModule(serviceCtx);   
    const friendsModule = setupFriendsModule(serviceCtx);
    const groupsModule = setupGroupsModule(serviceCtx);
    const expenseModule = setupExpenseModule(serviceCtx);

    app.use('/v1', userModule);
    app.use('/v1/friends', friendsModule);
    app.use('/v1/groups', groupsModule);
    app.use('/v1/expense', expenseModule);
    
    app.use('/uploads', serveStatic(path.join(__dirname, '../uploads')));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    // error handling
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      responseErr(err, res);
      return next();
    });

    // setup redis consumer
    setupUserConsumer(serviceCtx);

    const server = createServer(app);
    
    // Initialize Socket.IO
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',  // Allow all origins for now, can be restricted later
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    // Initialize chat module with Socket.IO
    const chatModule = initChatModule(io);
    app.use('/v1/chat', chatModule);
    
    // Initialize message module with the existing Socket.IO instance
    const messageModule = new MessageModule(io);
    app.use('/v1/messages', messageModule.router);

    server.listen(port, () => {
      Logger.success(`Server is running on port ${port}`);
      Logger.info('Socket.IO initialized for chat functionality');
    });
  } catch (e) {
    Logger.error(`Failed to start server: ${(e as Error).message}`);
    process.exit(1);
  }
}

const port = parseInt(config.port);
bootServer(port);