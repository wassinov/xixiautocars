'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Sheet = ({ children, open, onOpenChange }: SheetProps) => (
  <SheetContext.Provider value={{ open, onOpenChange }}>
    {children}
  </SheetContext.Provider>
);

const SheetContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);

const useSheetContext = () => {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error('Sheet components must be used within Sheet');
  return context;
};

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild = false, ...props }, ref) => {
  const { onOpenChange } = useSheetContext();
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </Comp>
  );
});
SheetTrigger.displayName = 'SheetTrigger';

const SheetClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => {
    const { onOpenChange } = useSheetContext();
    return (
      <button
        ref={ref}
        onClick={() => onOpenChange(false)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SheetClose.displayName = 'SheetClose';

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: 'left' | 'right' }
>(({ className, children, side = 'left', ...props }, ref) => {
    const { open, onOpenChange } = useSheetContext();
    if (!open) return null;

    return (
      <>
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className
          )}
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
        <div
          ref={ref}
          className={cn(
            'fixed z-50 flex max-h-full w-full flex-col gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
            side === 'left' && 'left-0 top-0 h-full w-64 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
            side === 'right' && 'right-0 top-0 h-full w-64 border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
            className
          )}
          {...props}
        >
          {children}
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
      </>
    );
  }
);
SheetContent.displayName = 'SheetContent';

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold text-neutral-900', className)} {...props} />
  )
);
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-neutral-500', className)} {...props} />
  )
);
SheetDescription.displayName = 'SheetDescription';

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };