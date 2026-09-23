import type { Response } from 'express';

export const apiError = (res: Response, status: number, error: string, message: string) =>
  res.status(status).json({ error, message });

export const notFound = (res: Response, message = 'Resource not found') => apiError(res, 404, 'NotFound', message);
