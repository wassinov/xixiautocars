import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border bg-white px-4 py-2.5 text-sm placeholder:text-ink-400 transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ink-50',
          error
            ? 'border-terracotta-500 focus-visible:ring-terracotta-500'
            : 'border-ink-200 hover:border-ink-300 focus-visible:border-accent-600',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };