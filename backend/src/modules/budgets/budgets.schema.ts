import { z } from 'zod';

const monthSchema = z.coerce.number().int().min(1).max(12);
const yearSchema = z.coerce.number().int().min(2020).max(2100);
const amountSchema = z
  .number()
  .int('Le montant doit être un nombre entier (Ariary)')
  .positive('Le montant doit être positif')
  .max(2_000_000_000, 'Montant trop élevé');

export const createBudgetSchema = z.object({
  categoryId: z.uuid('Catégorie invalide'),
  month: monthSchema,
  year: yearSchema,
  amount: amountSchema,
});

// Seul le plafond (amount) est modifiable après coup : changer la
// catégorie, le mois ou l'année reviendrait à "déplacer" le budget, ce
// qui est plus confusant qu'utile — on préfère alors en supprimer un et
// en recréer un autre.
export const updateBudgetSchema = z.object({
  amount: amountSchema,
});

export const listBudgetsQuerySchema = z.object({
  month: monthSchema.optional(),
  year: yearSchema.optional(),
});

export const budgetIdParamSchema = z.object({
  id: z.uuid('Identifiant invalide'),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
