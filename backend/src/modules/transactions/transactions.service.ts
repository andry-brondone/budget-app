import type { Category, Prisma, Transaction, TransactionType } from '../../config/prisma-client.js';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/api-error.js';
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from './transactions.schema.js';

export interface EmbeddedCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface TransactionDTO {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  categoryId: string | null;
  category: EmbeddedCategory | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionListResult {
  transactions: TransactionDTO[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  totals: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}

type TransactionWithCategory = Transaction & { category: Category | null };

const toDTO = (transaction: TransactionWithCategory): TransactionDTO => ({
  id: transaction.id,
  type: transaction.type,
  amount: transaction.amount,
  description: transaction.description,
  categoryId: transaction.categoryId,
  category: transaction.category
    ? {
        id: transaction.category.id,
        name: transaction.category.name,
        icon: transaction.category.icon,
        color: transaction.category.color,
      }
    : null,
  date: transaction.date,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
});

type ListFilters = Pick<ListTransactionsQuery, 'type' | 'categoryId' | 'dateFrom' | 'dateTo'>;

const buildWhereClause = (userId: string, filters: ListFilters): Prisma.TransactionWhereInput => {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.dateFrom ?? filters.dateTo) {
    where.date = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  return where;
};

/**
 * Vérifie qu'une catégorie est utilisable par cet utilisateur (catégorie
 * par défaut ou catégorie personnelle) et qu'elle correspond bien au type
 * de la transaction (ex: on ne peut pas assigner une catégorie "Salaire"
 * (INCOME) à une dépense).
 */
const assertCategoryIsUsable = async (
  userId: string,
  categoryId: string,
  type: TransactionType,
): Promise<void> => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, OR: [{ userId: null }, { userId }] },
  });

  if (!category) throw ApiError.badRequest('Catégorie invalide');
  if (category.type !== type) {
    throw ApiError.badRequest('Cette catégorie ne correspond pas au type de la transaction');
  }
};

export const listTransactions = async (
  userId: string,
  query: ListTransactionsQuery,
): Promise<TransactionListResult> => {
  const where = buildWhereClause(userId, query);
  const skip = (query.page - 1) * query.pageSize;

  const [transactions, totalItems, aggregates] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
      skip,
      take: query.pageSize,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = aggregates.find((row) => row.type === 'INCOME')?._sum.amount ?? 0;
  const totalExpense = aggregates.find((row) => row.type === 'EXPENSE')?._sum.amount ?? 0;

  return {
    transactions: transactions.map(toDTO),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
    },
    totals: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    },
  };
};

export const createTransaction = async (
  userId: string,
  input: CreateTransactionInput,
): Promise<TransactionDTO> => {
  if (input.categoryId) {
    await assertCategoryIsUsable(userId, input.categoryId, input.type);
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: input.type,
      amount: input.amount,
      description: input.description ?? null,
      categoryId: input.categoryId ?? null,
      date: input.date,
    },
    include: { category: true },
  });

  return toDTO(transaction);
};

export const getTransactionById = async (userId: string, id: string): Promise<TransactionDTO> => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    include: { category: true },
  });
  if (!transaction) throw ApiError.notFound('Transaction introuvable');
  return toDTO(transaction);
};

export const updateTransaction = async (
  userId: string,
  id: string,
  input: UpdateTransactionInput,
): Promise<TransactionDTO> => {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Transaction introuvable');

  const finalType = input.type ?? existing.type;
  // `!== undefined` (et non `??`) est nécessaire ici : `null` est une
  // valeur valide et intentionnelle (retirer la catégorie), à distinguer
  // de `undefined` (clé absente = ne pas toucher à la catégorie actuelle).
  const finalCategoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;

  if (finalCategoryId) {
    await assertCategoryIsUsable(userId, finalCategoryId, finalType);
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
    },
    include: { category: true },
  });

  return toDTO(transaction);
};

export const deleteTransaction = async (userId: string, id: string): Promise<void> => {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Transaction introuvable');

  await prisma.transaction.delete({ where: { id } });
};
