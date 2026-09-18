import { Suspense } from 'react';
import MessagesContent from './MessagesContent';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  );
}