import { z } from 'zod';
import { transactionTypeSchema } from '@/schemas/shared.schema';

export const transactionFormSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number('Montant invalide')
    .int('Le montant doit être un nombre entier')
    .positive('Le montant doit être positif')
    .max(2_000_000_000, 'Montant trop élevé'),
  categoryId: z.string().optional().or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(280, 'La note ne peut pas dépasser 280 caractères')
    .optional()
    .or(z.literal('')),
  date: z.string().min(1, 'La date est requise'),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
