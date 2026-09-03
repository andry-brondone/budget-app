import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetFormSchema, type BudgetFormValues } from '@/schemas/budget.schema';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { useCreateBudget } from '@/hooks/useBudgets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { FieldError } from '@/components/ui/FieldError';

interface BudgetFormProps {
  month: number;
  year: number;
  /** Catégories déjà budgétées ce mois-ci, à exclure du sélecteur pour
   * éviter une erreur de conflit évidente à la soumission. */
  excludedCategoryIds: string[];
  onSuccess: () => void;
}

export const BudgetForm = ({ month, year, excludedCategoryIds, onSuccess }: BudgetFormProps) => {
  const { data: categories } = useCategoriesQuery('EXPENSE');
  const createBudget = useCreateBudget(month, year);

  const availableCategories = (categories ?? []).filter(
    (category) => !excludedCategoryIds.includes(category.id),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: { categoryId: '', amount: 0 },
  });

  const onSubmit = handleSubmit((values) => {
    createBudget.mutate(values, { onSuccess });
  });

  if (availableCategories.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Toutes tes catégories de dépenses ont déjà un budget ce mois-ci.
      </p>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="budget-category">Catégorie</Label>
        <Select id="budget-category" {...register('categoryId')}>
          <option value="">Choisir...</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <FieldError message={errors.categoryId?.message} />
      </div>

      <div>
        <Label htmlFor="budget-amount">Plafond mensuel (Ariary)</Label>
        <Input
          id="budget-amount"
          type="number"
          inputMode="numeric"
          placeholder="100000"
          {...register('amount', { valueAsNumber: true })}
        />
        <FieldError message={errors.amount?.message} />
      </div>

      <Button type="submit" isLoading={createBudget.isPending}>
        Créer le budget
      </Button>
    </form>
  );
};
