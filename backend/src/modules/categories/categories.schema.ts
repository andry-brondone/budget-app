import { z } from 'zod';
import { transactionTypeSchema } from '../../shared/enums.schema.js';

const nameSchema = z.string().trim().min(1, 'Le nom est requis').max(60, 'Nom trop long');
const iconSchema = z.string().trim().max(40).optional();
const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide (format hexadécimal, ex: #10945b)')
  .optional();

export const createCategorySchema = z.object({
  name: nameSchema,
  type: transactionTypeSchema,
  icon: iconSchema,
  color: colorSchema,
});

export const updateCategorySchema = z
  .object({
    name: nameSchema.optional(),
    icon: iconSchema,
    color: colorSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune modification fournie',
  });

export const listCategoriesQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.uuid('Identifiant invalide'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
