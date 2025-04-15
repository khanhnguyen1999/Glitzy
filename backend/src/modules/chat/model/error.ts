import { AppError } from '@shared/utils/error';

export const ErrChatRoomNotFound = AppError.from(new Error('Chat room not found'), 404);
export const ErrUnauthorizedChatAccess = AppError.from(new Error('You are not authorized to access this chat'), 403);
export const ErrInvalidChatOperation = AppError.from(new Error('Invalid chat operation'), 400);
export const ErrMessageSendingFailed = AppError.from(new Error('Failed to send message'), 500);