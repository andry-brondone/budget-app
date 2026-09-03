import { z } from 'zod';
import { transactionTypeSchema } from '../../shared/enums.schema.js';

const amountSchema = z
  .number()
  .int('Le montant doit être un nombre entier (Ariary)')
  .positive('Le montant doit être positif')
  .max(2_000_000_000, 'Montant trop élevé');

const descriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(280, 'La note ne peut pas dépasser 280 caractères')
  .optional();

// Pour la mise à jour uniquement : `null` explicite permet de vider la
// note, à distinguer de `undefined` (clé absente = ne pas y toucher).
// Voir le même raisonnement pour `categoryId` ci-dessous.
const updateDescriptionSchema = z
  .union([z.string().trim().min(1).max(280, 'La note ne peut pas dépasser 280 caractères'), z.null()])
  .optional();

const categoryIdSchema = z.uuid('Catégorie invalide').optional();

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: amountSchema,
  description: descriptionSchema,
  categoryId: categoryIdSchema,
  date: z.coerce.date().default(() => new Date()),
});

export const updateTransactionSchema = z
  .object({
    type: transactionTypeSchema.optional(),
    amount: amountSchema.optional(),
    description: updateDescriptionSchema,
    // `undefined` (clé absente) = ne pas toucher à la catégorie.
    // `null` (explicite) = retirer la catégorie de la transaction.
    // `string` = assigner cette catégorie.
    categoryId: z.union([z.uuid('Catégorie invalide'), z.null()]).optional(),
    date: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune modification fournie',
  });

export const listTransactionsQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: z.uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const transactionIdParamSchema = z.object({
  id: z.uuid('Identifiant invalide'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
