import { AppError } from '@shared/utils';

export const ErrExpenseNotFound = AppError.from(new Error('Expense not found'), 404);

export const ErrGroupNotFound = AppError.from(new Error('Group not found'), 404);

export const ErrUserNotFound = AppError.from(new Error('User not found'), 404);

export const ErrUnauthorizedExpenseAccess = AppError.from(new Error('You are not authorized to access this expense'), 403);

export const ErrInvalidExpenseData = AppError.from(new Error('Invalid expense data provided'), 400);

export const ErrSplitAmountMismatch = AppError.from(new Error('The sum of split amounts does not match the total expense amount'), 400);

export const ErrPaidByNotInSplit = AppError.from(new Error('The user who paid must be included in the split'), 400);

export const ErrUserNotInGroup = AppError.from(new Error('User is not a member of this group'), 403);