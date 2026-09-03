import type { TransactionCategory } from '@/types/transaction.types';

export interface Budget {
  id: string;
  categoryId: string;
  category: TransactionCategory;
  month: number;
  year: number;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}
