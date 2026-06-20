import { Request, Response, NextFunction } from 'express';

export interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  console.error({
    status,
    message,
    code,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    error: {
      message,
      code,
      status,
    },
  });
};

export class ValidationError extends Error implements ErrorWithStatus {
  status = 400;
  code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error implements ErrorWithStatus {
  status = 404;
  code = 'NOT_FOUND';

  constructor(message: string = 'Recurso não encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error implements ErrorWithStatus {
  status = 401;
  code = 'UNAUTHORIZED';

  constructor(message: string = 'Não autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error implements ErrorWithStatus {
  status = 403;
  code = 'FORBIDDEN';

  constructor(message: string = 'Acesso proibido') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error implements ErrorWithStatus {
  status = 409;
  code = 'CONFLICT';

  constructor(message: string = 'Conflito') {
    super(message);
    this.name = 'ConflictError';
  }
}
