import { z } from 'zod';
import { AppError, ErrInvalidRequest } from './error';

/**
 * Validates request data against a Zod schema
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @returns The validated data
 * @throws BadRequestError if validation fails
 */
export function validateRequest<T>(data: unknown, schema: z.ZodType<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw AppError.from(ErrInvalidRequest, 400);
    }
    throw error;
  }
}
