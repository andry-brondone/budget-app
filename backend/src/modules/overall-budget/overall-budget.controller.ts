import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import {
  deleteOverallBudgetQuerySchema,
  getOverallBudgetQuerySchema,
  upsertOverallBudgetSchema,
} from './overall-budget.schema.js';
import { deleteOverallBudget, getOverallBudget, upsertOverallBudget } from './overall-budget.service.js';

export const get = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const query = getOverallBudgetQuerySchema.parse(req.query);
  const overallBudget = await getOverallBudget(userId, query);
  res.status(200).json({ overallBudget });
});

export const upsert = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const input = upsertOverallBudgetSchema.parse(req.body);
  const overallBudget = await upsertOverallBudget(userId, input);
  res.status(200).json({ overallBudget });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const query = deleteOverallBudgetQuerySchema.parse(req.query);
  await deleteOverallBudget(userId, query);
  res.status(204).send();
});
