import { PagingDTO } from '@shared/model';
import { Message, MessageDTO, MessageResponseDTO } from '../model';

export interface IMessageQueryRepository {
  findByGroupId(groupId: string, paging: PagingDTO): Promise<{ data: MessageResponseDTO[], pagination: any }>;
  findById(id: string): Promise<Message | null>;
}

export interface IMessageCommandRepository {
  create(messageData: MessageDTO): Promise<Message>;
  delete(id: string): Promise<void>;
}
