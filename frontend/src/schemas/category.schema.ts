import { z } from 'zod';
import { transactionTypeSchema } from '@/schemas/shared.schema';

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(60, 'Nom trop long'),
  type: transactionTypeSchema,
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide')
    .optional()
    .or(z.literal('')),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
