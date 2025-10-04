import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { authMiddleware } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    try {
      const result = await AuthService.register({ email, password, username });

      res.status(201).json({
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.message === 'Email already in use') {
        res.status(409).json({
          error: error.message,
          code: 'EMAIL_EXISTS',
        });
      } else {
        throw error;
      }
    }
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await AuthService.login({ email, password });

      res.status(200).json({
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      } else {
        throw error;
      }
    }
  })
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // User is already attached to request by authMiddleware
    res.status(200).json(req.user);
  })
);

export default router;
