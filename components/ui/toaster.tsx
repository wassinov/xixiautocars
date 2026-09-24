'use client';

import { useToast } from '@/components/ui/use-toast';
import { Toast, ToastViewport, ToastProvider } from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, ...props }) {
        return (
          <Toast key={id} {...props} />
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}