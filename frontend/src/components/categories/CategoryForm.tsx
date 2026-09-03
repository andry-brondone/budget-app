import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryFormSchema, type CategoryFormValues } from '@/schemas/category.schema';
import { useCreateCategory } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FieldError } from '@/components/ui/FieldError';
import type { TransactionType } from '@/types/transaction.types';

interface CategoryFormProps {
  type: TransactionType;
  onSuccess: (categoryId: string) => void;
}

// Formulaire volontairement minimal (nom uniquement) : le type est fixé
// par le contexte d'appel (le type de la transaction en cours), et
// l'icône/couleur sont dérivées automatiquement à l'affichage (voir
// lib/category-icons.ts) pour ne pas demander de code hexadécimal à
// l'utilisateur.
export const CategoryForm = ({ type, onSuccess }: CategoryFormProps) => {
  const createCategory = useCreateCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<CategoryFormValues, 'type'>>({
    resolver: zodResolver(categoryFormSchema.omit({ type: true })),
    defaultValues: { name: '' },
  });

  const onSubmit = handleSubmit((values) => {
    createCategory.mutate(
      { ...values, type },
      {
        onSuccess: (category) => {
          onSuccess(category.id);
        },
      },
    );
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="category-name">Nom de la catégorie</Label>
        <Input id="category-name" placeholder="Ex: Coiffure, Internet..." {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <Button type="submit" isLoading={createCategory.isPending}>
        Créer la catégorie
      </Button>
    </form>
  );
};
