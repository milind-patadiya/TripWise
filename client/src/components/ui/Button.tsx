import * as React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    const variants = {
      solid: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md hover:shadow-indigo-600/20',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-100',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-900 dark:hover:bg-slate-800 dark:text-slate-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md hover:shadow-red-600/20',
    };
    
    const sizes = {
      sm: 'h-9 px-3.5 text-xs',
      md: 'h-11 px-5 py-2',
      lg: 'h-12 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
