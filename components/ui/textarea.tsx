import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-ink-400 transition-colors duration-200 resize-y',
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
Textarea.displayName = 'Textarea';

export { Textarea };