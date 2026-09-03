import { Trash2 } from 'lucide-react';
import { useCategoriesQuery, useDeleteCategory } from '@/hooks/useCategories';
import { getCategoryColor, getCategoryIcon } from '@/lib/category-icons';
import { Spinner } from '@/components/ui/Spinner';

export const CategoryManager = () => {
  const { data: categories, isLoading } = useCategoriesQuery();
  const deleteCategory = useDeleteCategory();

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] space-y-2 overflow-y-auto">
      {categories?.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const color = getCategoryColor(category.color, category.name);

        return (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-700"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Icon size={16} style={{ color }} className="shrink-0" />
              <span className="truncate text-sm text-slate-800 dark:text-slate-200">{category.name}</span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                {category.type === 'INCOME' ? 'Revenu' : 'Dépense'}
              </span>
            </div>

            {category.isDefault ? (
              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">Par défaut</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Supprimer la catégorie "${category.name}" ?`)) {
                    deleteCategory.mutate(category.id);
                  }
                }}
                aria-label="Supprimer"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
