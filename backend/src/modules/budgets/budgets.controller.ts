import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import {
  budgetIdParamSchema,
  createBudgetSchema,
  listBudgetsQuerySchema,
  updateBudgetSchema,
} from './budgets.schema.js';
import { createBudget, deleteBudget, listBudgets, updateBudget } from './budgets.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const query = listBudgetsQuerySchema.parse(req.query);
  const budgets = await listBudgets(userId, query);
  res.status(200).json({ budgets });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const input = createBudgetSchema.parse(req.body);
  const budget = await createBudget(userId, input);
  res.status(201).json({ budget });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { id } = budgetIdParamSchema.parse(req.params);
  const input = updateBudgetSchema.parse(req.body);
  const budget = await updateBudget(userId, id, input);
  res.status(200).json({ budget });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { id } = budgetIdParamSchema.parse(req.params);
  await deleteBudget(userId, id);
  res.status(204).send();
});
