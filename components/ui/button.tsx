import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
        accent: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800',
        secondary: 'border border-ink-300 bg-white text-ink-900 hover:bg-ink-50 hover:border-ink-400 active:bg-ink-100',
        outline: 'border border-ink-300 bg-white text-ink-900 hover:bg-ink-50 hover:border-ink-400 active:bg-ink-100',
        terracotta: 'bg-terracotta-600 text-white hover:bg-terracotta-700 active:bg-terracotta-800',
        sage: 'bg-sage-600 text-white hover:bg-sage-700 active:bg-sage-800',
        ghost: 'text-ink-700 hover:bg-ink-100 active:bg-ink-200',
        link: 'text-accent-600 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 rounded-md',
        md: 'h-11 px-5 rounded-lg',
        lg: 'h-12 px-6 rounded-lg text-base',
        xl: 'h-14 px-8 rounded-lg text-lg',
        icon: 'h-11 w-11 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };