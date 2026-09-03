import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionIdParamSchema,
  updateTransactionSchema,
} from './transactions.schema.js';
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction,
} from './transactions.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const query = listTransactionsQuerySchema.parse(req.query);
  const result = await listTransactions(userId, query);
  res.status(200).json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const input = createTransactionSchema.parse(req.body);
  const transaction = await createTransaction(userId, input);
  res.status(201).json({ transaction });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { id } = transactionIdParamSchema.parse(req.params);
  const transaction = await getTransactionById(userId, id);
  res.status(200).json({ transaction });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { id } = transactionIdParamSchema.parse(req.params);
  const input = updateTransactionSchema.parse(req.body);
  const transaction = await updateTransaction(userId, id, input);
  res.status(200).json({ transaction });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { id } = transactionIdParamSchema.parse(req.params);
  await deleteTransaction(userId, id);
  res.status(204).send();
});
