import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ContactForm } from '@/components/ContactForm';
import { MapPin, Phone, Mail, Clock, Map, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n'; // BUG-20 : liens auto-préfixés par locale (fr = canonique nue)
import { GARAGE_INFO_ID } from '@/lib/constants'; // BUG-27 : singleton garage_infos
import { cn, magazineContainer, revealDelay } from '@/lib/utils';
import { languagesAlternates, SITE_URL } from '@/lib/seo'; // BUG-24 : hreflang
import { getTranslations, getLocale } from 'next-intl/server';
import { BreadcrumbSchema, LocalBusinessSchema } from '@/components/schema';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('contact'); // BUG-01 : getTranslations est async en next-intl v4
  return {
    title: `${t('title')} - Xixi Autocars`,
    description: t('description'),
    alternates: { languages: languagesAlternates('/contact') }, // BUG-24 : hreflang × 4 locales + x-default
  };
};

export default async function ContactPage() {
  const t = await getTranslations('contact'); // BUG-01 : getTranslations est async en next-intl v4
  const supabase = await createClient();
  const { data: garage } = await supabase
    .from('garage_infos')
    .select('*')
    .eq('id', GARAGE_INFO_ID)
    .single();

  const garageInfo = garage ?? {
    name: 'Xixi Autocars',
    address: '123 Rue de l\'Automobile',
    phone: '01 23 45 67 89',
    email: 'contact@xixiautocars.fr',
    opening_hours: 'Lundi-Vendredi: 9h-19h, Samedi: 9h-18h',
    google_maps_url: 'https://maps.google.com/?q=123+Rue+de+l\'Automobile',
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <BreadcrumbSchema
        locale={await getLocale()}
        items={[
          { name: 'Accueil', href: '/' },
          { name: 'Contact', href: '/contact' },
        ]}
      />
      <LocalBusinessSchema
        name="Xixi Autocars"
        description={garageInfo.about_text || 'Garage familial spécialisé dans la vente de véhicules neufs et d\'occasion, import/export, financement et services après-vente.'}
        address={{
          streetAddress: '2M-2 Zhongchuang incubator, Kangcheng North Road',
          addressLocality: 'Chongqing',
          addressRegion: 'Shapingba District',
          postalCode: '400000',
          addressCountry: 'CN',
        }}
        telephone="+86 23 1234 5678"
        email="contact@xixiautocars.com"
        url={SITE_URL}
        logo={`${SITE_URL}/logo.jpg`}
        image={`${SITE_URL}/og-image.jpg`}
        openingHours={['Monday 09:00-19:00', 'Tuesday 09:00-19:00', 'Wednesday 09:00-19:00', 'Thursday 09:00-19:00', 'Friday 09:00-19:00', 'Saturday 09:00-18:00']}
        priceRange="€€"
        currenciesAccepted="EUR, CNY"
        paymentAccepted="Cash, Credit Card, Bank Transfer, Financing"
        areaServed={['France', 'China', 'Europe', 'International']}
        geo={{ latitude: 29.5630, longitude: 106.5516 }}
      />
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-50 via-white to-white" aria-labelledby="contact-hero-title">
        <div className={magazineContainer('py-section lg:py-section-lg text-center')}>
          <h1 id="contact-hero-title" className="text-3xl lg:text-display-xl font-display font-bold text-ink-900 animate-reveal">{t('title')}</h1>
          <p className="mt-4 text-body-lg text-ink-600 max-w-2xl mx-auto animate-reveal delay-100">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <main className={magazineContainer('py-section lg:py-section-lg')}>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-display font-bold text-ink-900 animate-reveal">{t('form.title')}</h2>
            <ContactForm className={revealDelay(0)} />

            <div className={cn(revealDelay(1), 'bg-white rounded-2xl border border-ink-200 p-6')}>
              <h3 className="text-xl font-display font-semibold text-ink-900 mb-4">{t('engagements.title')}</h3>
              <ul className="space-y-3 text-xs text-ink-700">
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{t('engagements.responseTime')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{t('engagements.personalizedSupport')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{t('engagements.freeQuote')}</span>
                </li>
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className={cn(revealDelay(0), 'bg-white rounded-2xl border border-ink-200 p-6 sticky top-24')}>
              <h3 className="text-xl font-display font-semibold text-ink-900 mb-4">{t('info.title')}</h3>
              <dl className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-ink-500">{t('info.address')}</dt>
                    <dd className="mt-1 text-ink-600">{garageInfo.address}</dd>
                    {garageInfo.google_maps_url && (
                      <a href={garageInfo.google_maps_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-accent-600 hover:text-accent-700 hover:border-accent-300 transition-colors">
                        <Map className="h-3.5 w-3.5" />
                        {t('info.directions')}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-accent-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-ink-500">{t('info.phone')}</dt>
                    <dd className="mt-1"><a href={`tel:${garageInfo.phone.replace(/\s/g, '')}`} className="text-ink-600 hover:text-accent-600 hover:border-accent-300 transition-colors">{garageInfo.phone}</a></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-accent-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-ink-500">{t('info.email')}</dt>
                    <dd className="mt-1"><a href={`mailto:${garageInfo.email}`} className="text-ink-600 hover:text-accent-600 hover:border-accent-300 transition-colors">{garageInfo.email}</a></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-accent-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-ink-500">{t('info.hours')}</dt>
                    <dd className="mt-1 text-ink-600 whitespace-pre-line">{garageInfo.opening_hours}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className={cn(revealDelay(1), 'bg-accent-600 rounded-2xl p-6 text-white')}>
              <h3 className="text-xl font-display font-semibold mb-3">{t('info.quickCall')}</h3>
              <p className="text-accent-100 mb-4">{t('info.quickCallDesc')}</p>
              <a href={`tel:${garageInfo.phone.replace(/\s/g, '')}`} className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 text-accent-600 bg-white font-medium rounded-md',
                'hover:bg-accent-50 hover:border-accent-300 transition-colors'
              )}>
                <Phone className="h-5 w-5" />
                {t('info.callNow')}
              </a>
            </div>

            <div className={cn(revealDelay(2), 'bg-ink-950 rounded-2xl p-6 text-white text-center')}>
              <h3 className="text-xl font-display font-semibold mb-3">{t('visitUs.title')}</h3>
              <p className="text-ink-400 mb-4">{t('visitUs.description')}</p>
              <Link href="/catalogue" className={cn(
                'inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-ink-950',
                'bg-white rounded-lg hover:bg-ink-100 transition-colors hover:border-accent-300'
              )}>
                {t('viewCatalog')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
