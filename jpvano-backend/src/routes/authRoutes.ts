import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate, registerValidator, loginValidator, emailValidator, passwordResetValidator } from '../validators/index.js';

const router = Router();

// Wrap async handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

// Auth routes
router.post('/register', authLimiter, registerValidator(), validate, asyncHandler(authController.register));
router.post('/login', authLimiter, loginValidator(), validate, asyncHandler(authController.login));
router.post('/verify-email', emailValidator(), validate, asyncHandler(authController.verifyEmail));
router.post('/forgot-password', emailValidator(), validate, asyncHandler(authController.forgotPassword));
router.post('/reset-password', passwordResetValidator(), validate, asyncHandler(authController.resetPassword));
router.post('/verify-2fa', asyncHandler(authController.verifyTwoFactor));

// Protected routes
router.post('/enable-2fa', authMiddleware, asyncHandler(authController.enableTwoFactor));
router.post('/confirm-2fa', authMiddleware, asyncHandler(authController.confirmTwoFactor));
router.post('/refresh-token', asyncHandler(authController.refreshAccessToken));

export default router;
