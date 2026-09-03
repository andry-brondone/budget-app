import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { transactionFormSchema, type TransactionFormValues } from '@/schemas/transaction.schema';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FieldError } from '@/components/ui/FieldError';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/categories/CategoryForm';
import type { Transaction } from '@/types/transaction.types';
import { toDateInputValue } from '@/lib/format-date';

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: () => void;
}

export const TransactionForm = ({ transaction, onSuccess }: TransactionFormProps) => {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isEditing = Boolean(transaction);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          categoryId: transaction.categoryId ?? '',
          description: transaction.description ?? '',
          date: toDateInputValue(transaction.date),
        }
      : {
          type: 'EXPENSE',
          amount: 0,
          categoryId: '',
          description: '',
          date: toDateInputValue(new Date().toISOString()),
        },
  });

  const selectedType = watch('type');
  const { data: categories } = useCategoriesQuery(selectedType);

  const isSubmitting = isEditing ? updateTransaction.isPending : createTransaction.isPending;

  const onSubmit = handleSubmit((values) => {
    if (isEditing && transaction) {
      updateTransaction.mutate({ id: transaction.id, values }, { onSuccess });
    } else {
      createTransaction.mutate(values, { onSuccess });
    }
  });

  return (
    <>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" {...register('type')}>
            <option value="EXPENSE">Dépense</option>
            <option value="INCOME">Revenu</option>
          </Select>
          <FieldError message={errors.type?.message} />
        </div>

        <div>
          <Label htmlFor="amount">Montant (Ariary)</Label>
          <Input
            id="amount"
            type="number"
            inputMode="numeric"
            placeholder="50000"
            {...register('amount', { valueAsNumber: true })}
          />
          <FieldError message={errors.amount?.message} />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register('date')} />
          <FieldError message={errors.date?.message} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="categoryId" className="mb-0">
              Catégorie (optionnel)
            </Label>
            <button
              type="button"
              onClick={() => {
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              <Plus size={12} />
              Nouvelle
            </button>
          </div>
          <Select id="categoryId" {...register('categoryId')}>
            <option value="">Aucune</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.categoryId?.message} />
        </div>

        <div>
          <Label htmlFor="description">Note (optionnel)</Label>
          <Textarea id="description" placeholder="Détails de la transaction..." {...register('description')} />
          <FieldError message={errors.description?.message} />
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Enregistrer les modifications' : 'Ajouter la transaction'}
        </Button>
      </form>

      {isCategoryModalOpen ? (
        <Modal
          title="Nouvelle catégorie"
          onClose={() => {
            setIsCategoryModalOpen(false);
          }}
        >
          <CategoryForm
            type={selectedType}
            onSuccess={(categoryId) => {
              setValue('categoryId', categoryId);
              setIsCategoryModalOpen(false);
            }}
          />
        </Modal>
      ) : null}
    </>
  );
};
