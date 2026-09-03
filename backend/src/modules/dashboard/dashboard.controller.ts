import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { categoryBreakdownQuerySchema, monthlySummaryQuerySchema } from './dashboard.schema.js';
import { getCategoryBreakdown, getMonthlySummary } from './dashboard.service.js';

export const categoryBreakdown = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const query = categoryBreakdownQuerySchema.parse(req.query);
  const result = await getCategoryBreakdown(userId, query);
  res.status(200).json(result);
});

export const monthlySummary = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const query = monthlySummaryQuerySchema.parse(req.query);
  const items = await getMonthlySummary(userId, query);
  res.status(200).json({ items });
});
