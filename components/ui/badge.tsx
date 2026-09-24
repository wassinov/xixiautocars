import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'status' | 'highlight' | 'accent' | 'terracotta' | 'sage' | 'outline';
  size?: 'sm' | 'md';
}

function Badge({ className, variant = 'default', size = 'md', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2';
  const sizes = {
    sm: 'px-2 py-0.5 text-[0.625rem]',
    md: 'px-2.5 py-1 text-xs',
  };
  const variants = {
    default: 'bg-ink-100 text-ink-700',
    status: 'bg-ink-100 text-ink-700',
    highlight: 'bg-ink-900 text-white',
    accent: 'bg-accent-100 text-accent-700',
    terracotta: 'bg-terracotta-100 text-terracotta-800',
    sage: 'bg-sage-100 text-sage-800',
    outline: 'border border-ink-300 bg-transparent text-ink-700 hover:bg-ink-50',
  };

  return (
    <div
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

export { Badge };