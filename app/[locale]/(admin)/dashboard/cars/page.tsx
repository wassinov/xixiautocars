import { Suspense } from 'react';
import CarsContent from './CarsContent';

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Chargement...</div>}>
      <CarsContent />
    </Suspense>
  );
}