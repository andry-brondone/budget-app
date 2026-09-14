import { z } from 'zod';

const monthSchema = z.coerce.number().int().min(1).max(12);
const yearSchema = z.coerce.number().int().min(2020).max(2100);
const amountSchema = z
  .number()
  .int('Le montant doit être un nombre entier (Ariary)')
  .positive('Le montant doit être positif')
  .max(2_000_000_000, 'Montant trop élevé');

export const getOverallBudgetQuerySchema = z.object({
  month: monthSchema.optional(),
  year: yearSchema.optional(),
});

export const upsertOverallBudgetSchema = z.object({
  month: monthSchema,
  year: yearSchema,
  amount: amountSchema,
});

export const deleteOverallBudgetQuerySchema = z.object({
  month: monthSchema,
  year: yearSchema,
});

export type GetOverallBudgetQuery = z.infer<typeof getOverallBudgetQuerySchema>;
export type UpsertOverallBudgetInput = z.infer<typeof upsertOverallBudgetSchema>;
export type DeleteOverallBudgetQuery = z.infer<typeof deleteOverallBudgetQuerySchema>;
