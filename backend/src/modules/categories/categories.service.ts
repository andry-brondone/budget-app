import type { Category } from '../../config/prisma-client.js';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/api-error.js';
import type { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from './categories.schema.js';

export interface CategoryDTO {
  id: string;
  name: string;
  type: Category['type'];
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

const toDTO = (category: Category): CategoryDTO => ({
  id: category.id,
  name: category.name,
  type: category.type,
  icon: category.icon,
  color: category.color,
  isDefault: category.userId === null,
});

/**
 * Retourne les catégories par défaut (partagées) + les catégories
 * personnelles de l'utilisateur, triées avec les catégories par défaut
 * en premier puis par ordre alphabétique.
 */
export const listCategories = async (
  userId: string,
  query: ListCategoriesQuery,
): Promise<CategoryDTO[]> => {
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
      ...(query.type ? { type: query.type } : {}),
    },
    orderBy: [{ userId: 'asc' }, { name: 'asc' }],
  });

  return categories.map(toDTO);
};

export const createCategory = async (
  userId: string,
  input: CreateCategoryInput,
): Promise<CategoryDTO> => {
  const existing = await prisma.category.findFirst({
    where: { userId, name: { equals: input.name, mode: 'insensitive' }, type: input.type },
  });

  if (existing) throw ApiError.conflict('Une catégorie avec ce nom existe déjà pour ce type');

  const category = await prisma.category.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      icon: input.icon ?? null,
      color: input.color ?? null,
    },
  });

  return toDTO(category);
};

/** Vérifie que la catégorie existe et appartient bien à l'utilisateur
 * (les catégories par défaut, userId=null, ne sont jamais retournées ici
 * et donc jamais modifiables/supprimables par un utilisateur). */
const getOwnedCustomCategory = async (userId: string, id: string): Promise<Category> => {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) {
    throw ApiError.notFound('Catégorie introuvable, ou catégorie par défaut non modifiable');
  }
  return category;
};

export const updateCategory = async (
  userId: string,
  id: string,
  input: UpdateCategoryInput,
): Promise<CategoryDTO> => {
  await getOwnedCustomCategory(userId, id);

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
    },
  });

  return toDTO(category);
};

export const deleteCategory = async (userId: string, id: string): Promise<void> => {
  await getOwnedCustomCategory(userId, id);
  // Les transactions liées ne sont pas supprimées : la relation
  // `onDelete: SetNull` les détache simplement de la catégorie effacée.
  await prisma.category.delete({ where: { id } });
};
