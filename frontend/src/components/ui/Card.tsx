import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

export const Card = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-ink-700 dark:bg-ink-900',
        className,
      )}
    >
      {children}
    </div>
  );
};
