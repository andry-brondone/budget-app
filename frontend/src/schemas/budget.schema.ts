import { z } from 'zod';

// Le mois/l'année ne font pas partie du formulaire : ils sont fixés par
// le contexte d'appel (le mois actuellement affiché), à l'image de
// `type` dans CategoryForm.
export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'Choisissez une catégorie'),
  amount: z
    .number('Montant invalide')
    .int('Le montant doit être un nombre entier')
    .positive('Le montant doit être positif')
    .max(2_000_000_000, 'Montant trop élevé'),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
