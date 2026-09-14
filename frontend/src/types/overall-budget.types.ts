export interface OverallBudget {
  id: string | null;
  month: number;
  year: number;
  amount: number | null;
  spent: number;
  remaining: number | null;
  percentage: number | null;
}
