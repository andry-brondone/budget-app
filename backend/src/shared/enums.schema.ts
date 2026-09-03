import { z } from 'zod';

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);

export type TransactionTypeInput = z.infer<typeof transactionTypeSchema>;
