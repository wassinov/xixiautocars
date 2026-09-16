import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Menu, X, ChevronRight, ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations('nav');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
        <nav className="container-custom flex h-16 items-center justify-between" aria-label="Main navigation">
          <Link href={`/${locale}`} className="flex items-center gap-2" aria-label="Mon Garage - Accueil">
            <Truck className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-xl text-neutral-900 hidden sm:block">Mon Garage</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}`} className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
              {t('home')}
            </Link>
            <Link href={`/${locale}/catalogue`} className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
              {t('catalog')}
            </Link>
            <Link href={`/${locale}/contact`} className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
              {t('contact')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href={`/${locale}/login`} className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              {t('login')}
            </Link>

            <button className="md:hidden p-2 text-neutral-600 hover:text-neutral-900" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      <main className="min-h-screen">
        {children}
      </main>

      <footer className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
                <Truck className="h-8 w-8 text-primary-400" />
                <span className="font-bold text-xl">Mon Garage</span>
              </Link>
              <p className="text-neutral-400 max-w-xs">Votre garage de confiance depuis 1980. Véhicules neufs et d'occasion, révisés et garantis.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('contact')}</h4>
              <address className="not-italic text-neutral-400 space-y-2">
                <p>123 Rue de l'Automobile</p>
                <p>75000 Paris</p>
                <p><a href="tel:0123456789" className="hover:text-primary-400">01 23 45 67 89</a></p>
                <p><a href="mailto:contact@mongarage.fr" className="hover:text-primary-400">contact@mongarage.fr</a></p>
              </address>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horaires</h4>
              <p className="text-neutral-400 text-sm space-y-1">
                Lun-Ven: 9h-19h<br />
                Sam: 9h-18h<br />
                Dim: Fermé
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
            © 2024 Mon Garage. Tous droits réservés.
          </div>
        </div>
      </footer>
    </>
  );
}