import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[API Error]:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
    });
    return;
  }

  // Postgres unique constraint violation error code
  if (err.code === '23505') {
    res.status(409).json({
      success: false,
      error: 'Resource already exists or duplicate registration detected.'
    });
    return;
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    res.status(400).json({
      success: false,
      error: 'Referenced entity not found.'
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};
