import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Email validation schema
 */
const emailSchema = z.string().email('Invalid email format');

/**
 * Password validation schema (min 8 characters)
 */
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');

/**
 * Prompt validation schema (1-1000 characters)
 */
const promptSchema = z
  .string()
  .min(1, 'Prompt cannot be empty')
  .max(1000, 'Prompt must be less than 1000 characters');

/**
 * Orientation validation schema
 */
const orientationSchema = z.enum(['portrait', 'landscape']);

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

/**
 * Validate prompt length
 */
export const validatePrompt = (prompt: string): boolean => {
  return promptSchema.safeParse(prompt).success;
};

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
};

/**
 * Registration validation schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: z.string().max(50).optional(),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Create video validation schema
 */
export const createVideoSchema = z.object({
  prompt: promptSchema,
  orientation: orientationSchema.optional().default('portrait'),
});

export default validate;
