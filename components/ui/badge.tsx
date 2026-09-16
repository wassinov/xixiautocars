import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        {
          'bg-primary-100 text-primary-800': variant === 'default',
          'bg-neutral-100 text-neutral-800': variant === 'secondary',
          'bg-red-100 text-red-800': variant === 'destructive',
          'border border-neutral-300 bg-transparent': variant === 'outline',
          'bg-green-100 text-green-800': variant === 'success',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };