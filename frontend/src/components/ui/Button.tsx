import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300 dark:disabled:bg-brand-900',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-800',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
};

const spinnerClasses: Record<ButtonVariant, string> = {
  primary: 'border-white/30 border-t-white',
  secondary: 'border-white/30 border-t-white',
  ghost: 'border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300',
};

export const Button = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        className,
      )}
      disabled={disabled ?? isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner className={cn('h-4 w-4', spinnerClasses[variant])} />
          Veuillez patienter...
        </>
      ) : (
        children
      )}
    </button>
  );
};
