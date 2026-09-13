import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-ink-700 dark:bg-ink-900">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-ink-700">
        <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
};
