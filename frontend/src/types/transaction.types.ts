export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  categoryId: string | null;
  category: TransactionCategory | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
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
