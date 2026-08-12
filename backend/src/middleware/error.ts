import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Zod Validation Errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Invalid request data',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // 2. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Unique constraint violation: record already exists' });
    }
    return res.status(400).json({ error: 'Database query error', code: err.code });
  }

  // 3. Syntax / JSON Parsing Errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  // 4. Default Fallback Internal Server Error
  console.error('🔥 Unhandled Express Error:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: err.message && process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error'
  });
};
