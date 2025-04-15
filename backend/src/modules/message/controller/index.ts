import { Request, Response } from 'express';
import { MessageService } from '../service';
import { MessageDTO } from '../model';

export class MessageController {
  constructor(private messageService: MessageService) {}

  getMessagesByGroupId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const paging = {
        page: Number(page),
        limit: Number(limit)
      };

      const result = await this.messageService.getMessagesByGroupId(groupId, paging);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ message: 'Failed to get messages' });
    }
  };

  createMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const messageData: MessageDTO = req.body;
      
      const result = await this.messageService.createMessage(messageData);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Failed to create message' });
    }
  };

  deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.messageService.deleteMessage(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Failed to delete message' });
    }
  };
}
