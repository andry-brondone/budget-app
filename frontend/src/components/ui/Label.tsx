import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ className, ...rest }: LabelProps) => {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300', className)}
      {...rest}
    />
  );
};
