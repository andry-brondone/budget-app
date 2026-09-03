import { cn } from '@/lib/cn';

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => (
  <div
    role="status"
    aria-label="Chargement"
    className={cn(
      'h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-500',
      className,
    )}
  />
);
