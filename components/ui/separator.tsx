'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    variant?: 'default' | 'visible';
  }
>(({ className, orientation = 'horizontal', decorative = true, variant = 'default', ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      variant === 'visible' ? 'bg-ink-300' : 'bg-ink-200',
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };