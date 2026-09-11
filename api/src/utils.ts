import type { Response } from 'express';

export const notFound = (res: Response, message = 'Resource not found') =>
  res.status(404).json({ error: 'NotFound', message });

export const apiError = (res: Response, status: number, error: string, message: string) =>
  res.status(status).json({ error, message });
