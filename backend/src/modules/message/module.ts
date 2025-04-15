import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaMessageCommandRepository, PrismaMessageQueryRepository } from './infras/repository';
import { MessageService } from './service';
import { MessageController } from './controller';
import { MessageWebSocketHandler } from './websocket';

export class MessageModule {
  public router: Router;
  public webSocketHandler: MessageWebSocketHandler;
  
  constructor(io: SocketIOServer) {
    this.router = Router();
    
    // Initialize repositories
    const messageQueryRepository = new PrismaMessageQueryRepository();
    const messageCommandRepository = new PrismaMessageCommandRepository();
    
    // Initialize service
    const messageService = new MessageService(
      messageQueryRepository,
      messageCommandRepository
    );
    
    // Initialize controller
    const messageController = new MessageController(messageService);
    
    // Initialize WebSocket handler
    this.webSocketHandler = new MessageWebSocketHandler(io, messageService);
    
    // Set up routes
    this.setupRoutes(messageController);
  }
  
  private setupRoutes(controller: MessageController) {
    // Get messages for a group
    this.router.get('/group/:groupId', controller.getMessagesByGroupId);
    
    // Create a new message
    this.router.post('/', controller.createMessage);
    
    // Delete a message
    this.router.delete('/:id', controller.deleteMessage);
  }
}
