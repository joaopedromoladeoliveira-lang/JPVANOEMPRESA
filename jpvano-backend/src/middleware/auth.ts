import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/auth.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
  role?: string;
  user?: any;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  req.userId = payload.id;
  req.email = payload.email;
  req.role = payload.role;

  next();
};

export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.userId = payload.id;
      req.email = payload.email;
      req.role = payload.role;
    }
  }

  next();
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.role || req.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  }
  next();
};

export const moderatorMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.role || (req.role !== 'admin' && req.role !== 'moderator')) {
    return res.status(403).json({ error: 'Acesso restrito a moderadores' });
  }
  next();
};
