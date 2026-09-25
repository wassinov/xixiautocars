import { Metadata } from 'next';
import { Link } from '@/i18n'; // BUG-20 : liens auto-préfixés selon la locale (as-needed)
import { Truck, X, ChevronRight, ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MobileMenu } from '@/components/MobileMenu';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav');
  const tHome = useTranslations('home'); // BUG-23 : footer traduit

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-ink-200">
        <nav className="container-custom flex h-16 items-center justify-between" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2 hover:border-accent-300" aria-label="Xixi Autocars - Accueil">
            <Truck className="h-8 w-8 text-accent-600" />
            <span className="font-bold text-xl text-ink-900 hidden sm:block">Xixi Autocars</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-ink-700 hover:text-accent-600 hover:border-accent-300 transition-colors">
              {t('home')}
            </Link>
            <Link href="/catalogue" className="text-sm font-medium text-ink-700 hover:text-accent-600 hover:border-accent-300 transition-colors">
              {t('catalog')}
            </Link>
            <Link href="/a-propos" className="text-sm font-medium text-ink-700 hover:text-accent-600 hover:border-accent-300 transition-colors">
              {t('about')}
            </Link>
            <Link href="/contact" className="text-sm font-medium text-ink-700 hover:text-accent-600 hover:border-accent-300 transition-colors">
              {t('contact')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <MobileMenu />
          </div>
        </nav>
      </header>

      <main className="min-h-screen">
        {children}
      </main>

      <footer className="bg-ink-900 text-white py-12">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 text-accent-400 hover:border-accent-300">
                <Truck className="h-8 w-8 text-accent-400" />
                <span className="font-bold text-xl">Xixi Autocars</span>
              </Link>
              <p className="text-ink-400 max-w-xs">{tHome('footer.pitch')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('contact')}</h4>
              <address className="not-italic text-ink-400 space-y-2">
                <p>2M-2 Zhongchuang incubator, Kangcheng North Road, Xianglushan Street, Shapingba District, Chongqing</p>
                <p><a href="mailto:contact@xixiautocars.com" className="hover:text-accent-400 hover:border-accent-300">contact@xixiautocars.com</a></p>
              </address>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tHome('garage.hours')}</h4>
              <p className="text-ink-400 text-sm whitespace-pre-line">{tHome('footer.hours')}</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-ink-800 text-center text-ink-500 text-sm">
            {tHome('footer.rights')}
          </div>
        </div>
      </footer>
    </>
  );
}