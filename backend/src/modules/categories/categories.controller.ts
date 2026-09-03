import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from './categories.schema.js';
import { createCategory, deleteCategory, listCategories, updateCategory } from './categories.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const query = listCategoriesQuerySchema.parse(req.query);
  const categories = await listCategories(userId, query);
  res.status(200).json({ categories });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const input = createCategorySchema.parse(req.body);
  const category = await createCategory(userId, input);
  res.status(201).json({ category });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { id } = categoryIdParamSchema.parse(req.params);
  const input = updateCategorySchema.parse(req.body);
  const category = await updateCategory(userId, id, input);
  res.status(200).json({ category });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { id } = categoryIdParamSchema.parse(req.params);
  await deleteCategory(userId, id);
  res.status(204).send();
});
