import { Metadata } from 'next';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { CarCard } from '@/components/CarCard';
import { ContactForm } from '@/components/ContactForm';
import { ArrowRight, Truck, Shield, Wrench, CreditCard, MapPin, Phone, Mail, Clock, CheckCircle, Globe, Ship, FileText, CreditCard as CreditCardIcon, MessageCircle, MessageSquare, Mail as MailIcon, Star } from 'lucide-react';
import { Link } from '@/i18n';
import type { CarWithRelations } from '@/types/car';
import { cn, formatPrice, magazineContainer, revealDelay } from '@/lib/utils';
import { languagesAlternates } from '@/lib/seo';
import { GARAGE_INFO_ID } from '@/lib/constants';
import { getLocale, getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('home'); // BUG-23 (Étape 31) : metadata home traduite (ex titre FR figé sur les 4 locales)
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { languages: languagesAlternates('/') }, // BUG-24 : hreflang × 4 locales
  };
};

// BUG-23 : libellés externalisés dans messages/*.json (home.process / home.trust)
const PROCESS_STEPS = [
  { number: '01', icon: Globe, key: 'search' },
  { number: '02', icon: Shield, key: 'inspection' },
  { number: '03', icon: CreditCardIcon, key: 'payment' },
  { number: '04', icon: Ship, key: 'shipping' },
  { number: '05', icon: Truck, key: 'delivery' },
];

const TRUST_REASONS = [
  { icon: Star, key: 'inspection' },
  { icon: Star, key: 'network' },
  { icon: Star, key: 'documents' },
  { icon: Star, key: 'payment' },
];

const TESTIMONIALS = [
  { name: 'Marie D.', location: 'Lyon', vehicle: 'Peugeot 3008', rating: 5, text: 'Processus transparent de A à Z. Livraison à domicile en 2 semaines, véhicule impeccable.' },
  { name: 'Thomas R.', location: 'Marseille', vehicle: 'BMW X1', rating: 5, text: 'Reprise de mon ancienne voiture au juste prix. Financement clair, pas de mauvaise surprise.' },
  { name: 'Sophie L.', location: 'Bordeaux', vehicle: 'Toyota Yaris', rating: 5, text: 'Équipe réactive et professionnelle. Documents reçus avant la livraison, top !' },
];

export default async function HomePage() {
  const locale = await getLocale(); // BUG-22 : formats prix localisés
  const t = await getTranslations('home'); // BUG-23 : contenus traduits
  const supabase = await createClient();

  // Utilitaire : parse garage about_text → lignes avec icônes (utilise t résolu)
  function parseGarageInfoLines(text: string) {
    if (!text) return [];
    // Split par \n (réel) OU \n littéral (backslash-n dans la DB)
    const normalized = text.replace(/\\n/g, '\n');
    const lines = normalized.split(/\n|\r\n/).map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      const lower = line.toLowerCase();
      let icon: React.ReactNode = null;
      let label = '';
      let value = line;

      if (lower.includes('wechat') || lower.includes('微信')) {
        // WeChat icon - vert WeChat officiel
        icon = <MessageCircle className="h-5 w-5 text-[#07C160] shrink-0" aria-hidden="true" />;
        label = 'WeChat';
        value = line.replace(/^.*(wechat|微信)[:\s]*/i, '').trim();
      } else if (lower.includes('whatsapp')) {
        // WhatsApp icon - vert WhatsApp officiel
        icon = <MessageSquare className="h-5 w-5 text-[#25D366] shrink-0" aria-hidden="true" />;
        label = 'WhatsApp';
        value = line.replace(/^.*whatsapp[:\s]*/i, '').trim();
      } else if (lower.includes('téléphone') || lower.includes('phone') || lower.match(/^[\d\s+.-]{8,}$/)) {
        icon = <Phone className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />;
        label = t('garage.phone');
        value = line.replace(/^.*(téléphone|phone|tél)[:\s]*/i, '').trim();
      } else if (lower.includes('email') || lower.includes('mail') || lower.includes('@')) {
        icon = <MailIcon className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />;
        label = t('garage.email');
        value = line.replace(/^.*(email|mail)[:\s]*/i, '').trim();
      } else if (lower.includes('adresse') || lower.includes('address') || lower.includes('rue') || lower.includes('district') || lower.includes('chongqing')) {
        icon = <MapPin className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />;
        label = t('garage.address');
        value = line.replace(/^.*(adresse|address)[:\s]*/i, '').trim();
      }

      return { icon, label, value, raw: line };
    });
  }

  const result = await Promise.all([
      supabase
        .from('cars')
        .select(`
          id, is_new, year, mileage, price, currency, color, gearbox, fuel_type, is_featured,
          models (
            id, name, body_type,
            brands (name)
          ),
          car_images (image_url, is_primary)
        `)
        .eq('is_available', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('garage_infos')
        .select('*')
        .eq('id', GARAGE_INFO_ID)
        .single(),
    ]);

    const featuredCars = result[0].data;
    const garage = result[1].data;

    const transformedFeaturedCars = (featuredCars || []) as unknown as CarWithRelations[]; // BUG-07 : to-one = objet au runtime

    // Demande utilisateur (2026-09-24) : le bandeau « Reportage · Logistique » affiche la photo
    // du véhicule vedette (données réelles) ; repli sur l'ancienne photo générique si stock vide.
    const logisticsCar = transformedFeaturedCars[0];
    const logisticsImage =
      logisticsCar?.car_images?.find((img) => img.is_primary)?.image_url ??
      logisticsCar?.car_images?.[0]?.image_url ??
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80';
    const logisticsAlt = logisticsCar
      ? `${logisticsCar.models?.brands?.name ?? ''} ${logisticsCar.models?.name ?? ''}`.trim() || t('logistics.imageAlt')
      : t('logistics.imageAlt'); // alt = nom réel du véhicule affiché

    const garageInfo = garage ?? {
    name: 'Xixi Autocars',
    address: '123 Rue de l\'Automobile',
    phone: '01 23 45 67 89',
    email: 'contact@xixiautocars.fr',
    opening_hours: 'Lundi-Vendredi: 9h-19h, Samedi: 9h-18h',
    google_maps_url: 'https://maps.google.com/?q=123+Rue+de+l\'Automobile',
    about_text: 'Nous sommes un garage familial passionné par les automobiles depuis 1980.',
  };

  return (
    <main className="bg-ink-50">
      {/* Hero Asymétrique */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-50 via-white to-white py-12 lg:py-24" aria-labelledby="hero-title">
        <div className={magazineContainer()}>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
            {/* Contenu gauche - 7 colonnes */}
            <div className={cn(revealDelay(0), 'lg:col-span-7', 'lg:flex lg:flex-col lg:justify-center')}>
              <div className="">
                <span className="inline-block px-4 py-1.5 text-sm font-medium text-accent-700 bg-accent-100 rounded-full mb-6 animate-reveal">
                  {t('hero.badge')}
                </span>
                <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-ink-900 leading-tight tracking-tight animate-reveal delay-100">
                  {t.rich('hero.title', { span: (chunks) => <span className="text-accent-600">{chunks}</span> })}
                </h1>
                <p className="mt-6 text-base text-ink-600 max-w-xl animate-reveal delay-200">
                  {t('hero.description')}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-reveal delay-300">
                  <Link href="/catalogue" className={cn(
                    'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white',
                    'bg-ink-900 rounded-lg hover:bg-ink-800 active:bg-ink-950',
                    ' hover:border-accent-300 transition-all duration-300 ease-in-out'
                  )}>
                    {t('hero.ctaCatalog')}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/contact" className={cn(
                    'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium',
                    'bg-accent-600 text-white rounded-lg hover:bg-accent-700 active:bg-accent-800',
                    ' hover:border-accent-300 transition-all duration-300 ease-in-out'
                  )}>
                    {t('hero.ctaContact')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Image droite - 5 colonnes */}
            <div className={cn(revealDelay(1), 'lg:col-span-5')}>
              <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden rounded-2xl lg:rounded-none lg:rounded-tr-2xl lg:rounded-br-2xl bg-ink-100">
                {transformedFeaturedCars[0]?.car_images?.[0] ? (
                  <Image
                    src={transformedFeaturedCars[0].car_images[0].image_url}
                    alt={`${transformedFeaturedCars[0].models?.brands?.name} ${transformedFeaturedCars[0].models?.name}`}
                    fill
                    className="object-contain scale-105 bg-ink-100"
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-400">
                    <Truck className="h-24 w-24" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" aria-hidden="true" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm font-medium uppercase tracking-wider">{t('heroSpotlight')}</p>
                  <p className="mt-1 text-xl font-display font-bold">
                    {transformedFeaturedCars[0]?.models?.brands?.name} {transformedFeaturedCars[0]?.models?.name}
                  </p>
                  <p className="mt-1 text-base font-mono">
                    {transformedFeaturedCars[0] ? formatPrice(transformedFeaturedCars[0].price, transformedFeaturedCars[0].currency, locale) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sélection du moment */}
      <section className="py-section lg:py-section-lg" aria-labelledby="featured-title">
        <div className={magazineContainer()}>
          <div className="flex items-center justify-between mb-10">
            <div className={revealDelay(0)}>
              <h2 id="featured-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900">{t('featured.title')}</h2>
              <p className="mt-2 text-base text-ink-600">{t('featured.subtitle')}</p>
            </div>
            <Link href="/catalogue" className="hidden sm:inline-flex items-center gap-2 text-accent-600 font-medium hover:text-accent-700 transition-colors hover:border-accent-300">
              {t('featured.viewAll')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {transformedFeaturedCars && transformedFeaturedCars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {transformedFeaturedCars.map((car, i) => (
                <CarCard key={car.id} car={car} priority={i < 3} className={cn(revealDelay(i), 'hover:border-accent-300')} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-ink-100 rounded-2xl">
              <p className="text-ink-600">{t('featuredEmpty')}</p>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link href="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-accent-600 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors hover:border-accent-300">
              {t('featured.viewAll')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Processus 5 étapes */}
      <section className="py-section lg:py-section-lg bg-white" aria-labelledby="process-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="process-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900 animate-reveal">{t('process.title')}</h2>
            <p className="mt-3 text-body-lg text-ink-600 animate-reveal delay-100">{t('process.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS_STEPS.map((step, i) => (
              <article key={step.number} className={cn(
                'relative p-6 bg-ink-50 rounded-2xl border border-ink-200 text-center',
                'hover:border-accent-300 transition-all duration-300 ease-in-out',
                revealDelay(i)
              )}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-accent-600 text-white text-sm font-bold flex items-center justify-center">
                  {step.number}
                </span>
                <div className="w-14 h-14 mx-auto mt-6 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600">
                  <step.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-display font-semibold text-ink-900">{t(`process.steps.${step.key}.title`)}</h3>
                <p className="mt-2 text-base text-ink-600">{t(`process.steps.${step.key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Bandeau reportage logistique */}
      <section className="relative py-section-lg lg:py-[120px] overflow-hidden" aria-labelledby="logistics-title">
        <div className="absolute inset-0 bg-ink-950" aria-hidden="true" />
        <div className="relative">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-900/80 to-transparent" aria-hidden="true" />
                <Image
                  src={logisticsImage} // photo du véhicule vedette (DB) — ex photo générique Unsplash en repli
                  alt={logisticsAlt}
                  fill
                  className="object-cover opacity-40"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-accent-400 bg-accent-900/30 rounded-full mb-4 backdrop-blur">
                    {t('logistics.badge')}
                  </span>
                  <h2 id="logistics-title" className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight max-w-2xl">
                    {t.rich('logistics.title', { span: (chunks) => <span className="text-accent-400">{chunks}</span> })}
                  </h2>
                  <p className="mt-4 text-body-lg text-ink-300 max-w-xl">
                    {t('logistics.description')}
                  </p>
                  <Link href="/contact" className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-ink-900 bg-white rounded-lg hover:bg-ink-100 transition-colors w-fit hover:border-accent-300">
                    {t('logistics.cta')}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Raisons de choisir Xixi */}
      <section className="py-12 lg:py-16 bg-ink-50" aria-labelledby="trust-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 id="trust-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900 animate-reveal">{t('trust.title')}</h2>
            <p className="mt-3 text-body-lg text-ink-600 animate-reveal delay-100">{t('trust.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_REASONS.map((reason, i) => (
              <article key={reason.key} className={cn(
                'p-6 bg-white rounded-2xl border border-ink-200',
                'hover:border-accent-300 transition-all duration-300 ease-in-out',
                revealDelay(i)
              )}>
                <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                  <reason.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t(`trust.items.${reason.key}.title`)}</h3>
                <p className="mt-2 text-base text-ink-600">{t(`trust.items.${reason.key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-12 lg:py-16 bg-white" aria-labelledby="testimonials-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 id="testimonials-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900 animate-reveal">{t('testimonials.title')}</h2>
            <p className="mt-3 text-body-lg text-ink-600 animate-reveal delay-100">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial, i) => (
              <article key={testimonial.name} className={cn(
                'p-6 bg-ink-50 rounded-2xl border border-ink-200',
                'hover:border-accent-300',
                revealDelay(i)
              )}>
                <div className="flex items-center gap-1" aria-label={t('testimonials.ratingLabel', { rating: testimonial.rating })}>
                  {[...Array(testimonial.rating)].map((_, idx) => (
                    <Star key={idx} className="h-5 w-5 text-terracotta-500 fill-terracotta-500" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-4 text-base text-ink-700 italic leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <footer className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{testimonial.name}</p>
                    <p className="text-sm text-ink-500">{testimonial.vehicle} · {testimonial.location}</p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-section-lg lg:py-[100px] bg-ink-950" aria-labelledby="cta-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-3xl mx-auto">
            <h2 id="cta-title" className="text-3xl sm:text-4xl font-display font-bold text-white animate-reveal">{t('cta.title')}</h2>
            <p className="mt-4 text-body-lg text-ink-400 animate-reveal delay-100">{t('cta.description')}</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal delay-200">
              <Link href="/contact" className={cn(
                'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-ink-900',
                'bg-white rounded-lg hover:bg-ink-100 active:bg-ink-200',
                ' hover:border-accent-300 transition-all duration-300 ease-in-out'
              )}>
                {t('cta.contact')}
              </Link>
              <Link href="/catalogue" className={cn(
                'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white',
                'bg-accent-600 rounded-lg hover:bg-accent-700 active:bg-accent-800',
                ' hover:border-accent-300 transition-all duration-300 ease-in-out'
              )}>
                {t('cta.catalog')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Infos Garage + Contact Form */}
      <section className="py-12 lg:py-16 bg-ink-50" aria-labelledby="garage-title">
        <div className={magazineContainer()}>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-6">
              <div className={revealDelay(0)}>
                <h2 className="text-2xl font-display font-bold text-ink-900">{garageInfo.name}</h2>
                
                {/* Garage description */}
                <div className="mt-4 space-y-3">
                  {/* Main description (first non-contact line) */}
                  {(() => {
                    const lines = parseGarageInfoLines(garageInfo.about_text || '');
                    const mainDesc = lines.find(l => !l.icon && !l.label)?.raw || garageInfo.about_text;
                    return mainDesc ? <p className="text-base text-ink-600">{mainDesc}</p> : null;
                  })()}

                  {/* Unified contact list - 2 equal columns */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* Column 1: Phone + WeChat + WhatsApp (stacked) */}
                    <div className="flex flex-col gap-3">
                      {/* Phone from DB */}
                      <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-ink-200 hover:border-accent-300 transition-colors hover:shadow-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-accent-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-ink-900">{t('garage.phone')}</h4>
                          <a href={`tel:${garageInfo.phone.replace(/\s/g, '')}`} className="mt-1 text-ink-600 hover:text-accent-600 transition-colors break-all text-sm">{garageInfo.phone}</a>
                        </div>
                      </div>

                      {/* WeChat from about_text */}
                      {(() => {
                        const lines = parseGarageInfoLines(garageInfo.about_text || '').filter(l => l.label === 'WeChat');
                        if (lines.length === 0) return null;
                        const line = lines[0];
                        return (
                          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-ink-200 hover:border-accent-300 transition-colors hover:shadow-lg">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
                              {line.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-ink-900">{line.label}</h4>
                              <p className="mt-1 text-ink-600 break-all text-sm">{line.value}</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* WhatsApp from about_text */}
                      {(() => {
                        const lines = parseGarageInfoLines(garageInfo.about_text || '').filter(l => l.label === 'WhatsApp');
                        if (lines.length === 0) return null;
                        const line = lines[0];
                        return (
                          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-ink-200 hover:border-accent-300 transition-colors hover:shadow-lg">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
                              {line.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-ink-900">{line.label}</h4>
                              <a href={`https://wa.me/${line.value.replace(/[^\d+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-1 text-ink-600 hover:text-accent-600 transition-colors break-all text-sm">{line.value}</a>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Column 2: QR Code */}
                    <div className="flex flex-col gap-3">
                      {/* WeChat QR Code */}
                      {garageInfo.wechat_qr_url && (
                        <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-ink-200 hover:border-accent-300 transition-colors hover:shadow-lg">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-[#07C160]" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col items-center">
                            <a
                              href="https://u.wechat.com/EPx-9YxlHCnOcLsyXh7joCw?s=2"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <Image
                                src={garageInfo.wechat_qr_url}
                                alt="WeChat QR Code"
                                width={120}
                                height={120}
                                className="rounded-lg border border-ink-200 hover:border-accent-300 transition-colors"
                              />
                            </a>
                            <p className="mt-2 text-sm font-medium text-[#07C160] text-center">WeChat Scannez moi !</p>
                          </div>
                        </div>
                      )}

                      {/* Empty spacer - keeps column height balanced */}
                      <div className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${revealDelay(1)} lg:col-span-8`}>
              <div className="p-6 bg-white rounded-2xl border border-ink-200 sticky top-24 hover:border-accent-300">
                <h3 className="text-xl font-display font-bold text-ink-900">{t('garage.contactTitle')}</h3>
                <p className="mt-2 text-base text-ink-600">{t('garage.contactDesc')}</p>
                <ContactForm carName="véhicule" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}