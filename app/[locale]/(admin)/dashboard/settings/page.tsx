import { Suspense } from 'react';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Chargement...</div>}>
      <SettingsForm />
    </Suspense>
  );
}