import type { TransactionFilters as TransactionFiltersValue } from '@/hooks/useTransactions';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

interface TransactionFiltersProps {
  filters: TransactionFiltersValue;
  onChange: (filters: TransactionFiltersValue) => void;
}

export const TransactionFilters = ({ filters, onChange }: TransactionFiltersProps) => {
  const { data: categories } = useCategoriesQuery(filters.type);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-40">
        <label htmlFor="filter-type" className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Type
        </label>
        <Select
          id="filter-type"
          value={filters.type ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              type: value === 'INCOME' || value === 'EXPENSE' ? value : undefined,
              categoryId: undefined,
              page: 1,
            });
          }}
        >
          <option value="">Tous</option>
          <option value="EXPENSE">Dépenses</option>
          <option value="INCOME">Revenus</option>
        </Select>
      </div>

      <div className="w-48">
        <label htmlFor="filter-category" className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Catégorie
        </label>
        <Select
          id="filter-category"
          value={filters.categoryId ?? ''}
          onChange={(event) => {
            onChange({ ...filters, categoryId: event.target.value || undefined, page: 1 });
          }}
        >
          <option value="">Toutes</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="filter-from" className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Du
        </label>
        <Input
          id="filter-from"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(event) => {
            onChange({ ...filters, dateFrom: event.target.value || undefined, page: 1 });
          }}
        />
      </div>

      <div>
        <label htmlFor="filter-to" className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Au
        </label>
        <Input
          id="filter-to"
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(event) => {
            onChange({ ...filters, dateTo: event.target.value || undefined, page: 1 });
          }}
        />
      </div>
    </div>
  );
};
