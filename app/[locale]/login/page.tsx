import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('admin.login'); // BUG-33 : titre traduit + noindex
  return {
    title: `${t('title')} - Xixi Autocars`,
    robots: { index: false, follow: false }, // page d'auth : hors index
  };
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}