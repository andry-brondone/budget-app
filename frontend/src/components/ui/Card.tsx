import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

export const Card = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      {children}
    </div>
  );
};
