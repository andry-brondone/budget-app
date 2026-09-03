import { z } from 'zod';
import { transactionTypeSchema } from '../../shared/enums.schema.js';

const monthSchema = z.coerce.number().int().min(1).max(12);
const yearSchema = z.coerce.number().int().min(2020).max(2100);

export const categoryBreakdownQuerySchema = z.object({
  month: monthSchema.optional(),
  year: yearSchema.optional(),
  type: transactionTypeSchema.optional(),
});

export const monthlySummaryQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export type CategoryBreakdownQuery = z.infer<typeof categoryBreakdownQuerySchema>;
export type MonthlySummaryQuery = z.infer<typeof monthlySummaryQuerySchema>;
