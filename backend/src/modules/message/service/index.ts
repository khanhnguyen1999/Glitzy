import { IMessageCommandRepository, IMessageQueryRepository } from '../interface';
import { MessageDTO, MessageResponseDTO } from '../model';
import { PagingDTO } from '@shared/model';

export class MessageService {
  constructor(
    private messageQueryRepository: IMessageQueryRepository,
    private messageCommandRepository: IMessageCommandRepository
  ) {}

  async getMessagesByGroupId(groupId: string, paging: PagingDTO): Promise<{ data: MessageResponseDTO[], pagination: any }> {
    return this.messageQueryRepository.findByGroupId(groupId, paging);
  }

  async createMessage(messageData: MessageDTO): Promise<MessageResponseDTO> {
    const message = await this.messageCommandRepository.create(messageData);
    
    // Return the message with sender information
    // In a real application, you would fetch the sender info here
    return {
      ...message,
      sender: undefined // This will be populated by the WebSocket handler
    };
  }

  async deleteMessage(id: string): Promise<void> {
    await this.messageCommandRepository.delete(id);
  }
}
