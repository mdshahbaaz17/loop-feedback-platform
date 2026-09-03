import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Zod Validation Errors
  if (err instanceof z.ZodError || err?.name === 'ZodError') {
    const issues = (err as any).issues || (err as any).errors || [];
    return res.status(400).json({
      error: 'Invalid request data',
      details: issues.map((e: any) => ({
        path: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
        message: e.message
      }))
    });
  }

  // 2. Prisma Database Errors
  if (err?.code) {
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
