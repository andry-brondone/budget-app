import type { TransactionType } from '@/types/transaction.types';

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  amount: number;
  percentage: number;
}

export interface CategoryBreakdownResponse {
  type: TransactionType;
  month: number;
  year: number;
  items: CategoryBreakdownItem[];
  total: number;
}

export interface MonthlySummaryItem {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}
