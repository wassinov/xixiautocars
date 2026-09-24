import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ImageGallery } from '@/components/ImageGallery';
import { ContactForm } from '@/components/ContactForm';
import { Calendar, MapPin, Fuel, Settings, Tag, Truck, Shield, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n'; // BUG-20 : liens auto-préfixés par locale (fr = canonique nue)
import { GARAGE_INFO_ID } from '@/lib/constants'; // BUG-27 : singleton garage_infos
import { getTranslations, getLocale } from 'next-intl/server'; // BUG-02 : getTranslations/getLocale sont async en next-intl v4
import type { CarWithRelations } from '@/types/car';
import { cn, magazineContainer, revealDelay, formatPrice, formatMileage } from '@/lib/utils';
import { languagesAlternates } from '@/lib/seo'; // BUG-24 : hreflang

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const tCommon = await getTranslations('common'); // BUG-02 : déclaré AVANT usage, et awaité
  const supabase = await createClient();
  const { data: car } = await supabase
    .from('cars')
    .select('models (name, brands (name)), year, price, currency')
    .eq('id', id)
    .single();

  if (!car) return { title: tCommon('notFound') };

  // BUG-07 : models est un embed to-one → PostgREST renvoie un OBJET au runtime
  // (l'inférence postgrest sans schéma typé devine « tableau » : passage par unknown)
  const model = car.models as unknown as { name: string; brands: { name: string } } | null;
  const brandName = model?.brands?.name;
  const modelName = model?.name;
  const t = await getTranslations('car');

  return {
    title: `${brandName} ${modelName} (${car.year}) - ${formatPrice(car.price, car.currency, locale)}`,
    description: `${brandName} ${modelName} ${car.year} - ${formatPrice(car.price, car.currency, locale)}. ${t('availableAtGarage')}`,
    alternates: { languages: languagesAlternates(`/catalogue/${id}`) }, // BUG-24 : hreflang × 4 locales + x-default
    openGraph: {
      title: `${brandName} ${modelName} (${car.year})`,
      description: `${t('price')}: ${formatPrice(car.price, car.currency, locale)}`,
      type: 'website',
    },
  };
}

async function getCar(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cars')
    .select(`
      *,
      models (
        id, name, body_type,
        brands (id, name)
      ),
      car_images (id, image_url, is_primary, order_index)
    `)
    .eq('id', id)
    .eq('is_available', true)
    .single();

  if (error || !data) return null;
  return data as unknown as CarWithRelations; // BUG-07 : to-one = objet au runtime
}

async function getGarage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('garage_infos')
    .select('*')
    .eq('id', GARAGE_INFO_ID) // BUG-27 : singleton
    .single();
  return data;
}

type SpecConfig = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  format?: (v: number) => string;
  nested?: keyof CarData;
};

type CarData = {
  year: number;
  mileage: number | null;
  fuel_type: string | null;
  gearbox: string | null;
  color: string | null;
  models: { body_type: string | null } | null;
};

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations('car'); // BUG-02 : await + configs internalisées (t n'existe pas au scope module)
  const tNav = await getTranslations('nav');
  const tContact = await getTranslations('contact');
  const [car, garage] = await Promise.all([getCar(id), getGarage()]);

  if (!car) notFound();

  // BUG-02 : SPECS était un const de module référençant t() hors scope — internalisé dans le rendu
  const SPECS: SpecConfig[] = [
    { key: 'year', label: t('year'), icon: Calendar },
    { key: 'mileage', label: t('mileage'), icon: MapPin, format: (v: number) => formatMileage(v, locale) }, // BUG-22 : format localisé
    { key: 'fuel_type', label: t('fuel'), icon: Fuel },
    { key: 'gearbox', label: t('gearbox'), icon: Settings },
    { key: 'color', label: t('color'), icon: Tag },
    { key: 'body_type', label: t('bodyType'), icon: Truck, nested: 'models' },
  ];

  const INCLUDED_SERVICES = [
    { icon: Shield, label: t('services.warranty') },
    { icon: CheckCircle, label: t('services.inspected') },
    { icon: CheckCircle, label: t('services.admin') },
    { icon: CheckCircle, label: t('services.delivery') },
    { icon: CheckCircle, label: t('services.tradein') },
    { icon: CheckCircle, label: t('services.financing') },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="border-b border-ink-200 bg-white/80 backdrop-blur sticky top-0 z-40" aria-label="Fil d'Ariane">
        <div className={magazineContainer('py-3')}>
          <ol className="flex items-center gap-2 text-sm text-ink-500">
            <li><Link href="/" className="hover:text-accent-600 hover:border-accent-300 transition-colors">{tNav('home')}</Link></li>
            <li className="text-ink-300">/</li>
            <li><Link href="/catalogue" className="hover:text-accent-600 hover:border-accent-300 transition-colors">{tNav('catalog')}</Link></li>
            <li className="text-ink-300">/</li>
            <li className="text-ink-900 font-medium truncate max-w-[200px]">{car.models?.brands?.name} {car.models?.name}</li>
          </ol>
        </div>
      </nav>

      <main className={magazineContainer('py-section lg:py-section-lg')}>
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {car.is_new && (
              <span className="px-3 py-1 text-sm font-medium text-white bg-sage-600 rounded-full">
                {t('new')}
              </span>
            )}
            {car.is_featured && (
              <span className="px-3 py-1 text-sm font-medium text-white bg-accent-600 rounded-full">
                {t('featured')}
              </span>
            )}
          </div>
          <h1 className="text-3xl lg:text-display-xl font-display font-bold text-ink-900">{car.models?.brands?.name} {car.models?.name}</h1>
          <p className="mt-3 text-2xl lg:text-3xl font-display font-bold text-accent-600">{formatPrice(car.price, car.currency, locale)}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <section aria-labelledby="gallery-title" className={revealDelay(0)}>
              <ImageGallery images={car.car_images} carName={`${car.models?.brands?.name} ${car.models?.name}`} />
            </section>

            <section aria-labelledby="specs-title" className={revealDelay(1)}>
              <h2 id="specs-title" className="text-xl font-display font-semibold text-ink-900 mb-6">{t('specs')}</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SPECS.map((spec) => {
                  const source = spec.nested ? car[spec.nested as keyof typeof car] : car;
                  const value = source?.[spec.key as keyof typeof source];
                  if (value === null || value === undefined || value === '') return null;
                  const Icon = spec.icon;
                  return (
                    <div key={spec.key} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-ink-200 hover:border-accent-300 transition-colors">
                      <Icon className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />
                      <div>
                        <dt className="text-sm text-ink-500">{spec.label}</dt>
                        <dd className="text-base font-medium text-ink-900 font-mono">
                          {spec.format ? spec.format(value as number) : String(value)}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </section>

            {car.description && (
              <section aria-labelledby="desc-title" className={revealDelay(2)}>
                <h2 id="desc-title" className="text-xl font-display font-semibold text-ink-900 mb-4">{t('description')}</h2>
                <div className="prose prose-ink max-w-none whitespace-pre-line text-ink-700">
                  {car.description}
                </div>
              </section>
            )}

            {car.features && Object.keys(car.features).length > 0 && (
              <section aria-labelledby="features-title" className={revealDelay(3)}>
                <h2 id="features-title" className="text-xl font-display font-semibold text-ink-900 mb-4">{t('features')}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(car.features).map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2 text-ink-700 p-3 bg-white rounded-2xl border border-ink-200">
                      <CheckCircle className="h-5 w-5 text-sage-600 shrink-0" aria-hidden="true" />
                      <span className="font-mono text-xs">{key.replace(/_/g, ' ')}</span>
                      {value !== true && <span className="text-ink-500 ml-auto">: {String(value)}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="garage-title" className={revealDelay(4)}>
              <h2 id="garage-title" className="text-xl font-display font-semibold text-ink-900 mb-4">{garage?.name || 'Xixi Autocars'}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-white rounded-2xl border border-ink-200">
                  <h3 className="font-medium text-ink-900">{tContact('info.address')}</h3>
                  <p className="mt-1 text-ink-600">{garage?.address}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-ink-200">
                  <h3 className="font-medium text-ink-900">{tContact('info.hours')}</h3>
                  <p className="mt-1 text-ink-600 whitespace-pre-line">{garage?.opening_hours}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-ink-200">
                  <h3 className="font-medium text-ink-900">{tContact('info.phone')}</h3>
                  <a href={`tel:${garage?.phone?.replace(/\s/g, '')}`} className="mt-1 text-ink-600 hover:text-accent-600 hover:border-accent-300 transition-colors">{garage?.phone}</a>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-ink-200">
                  <h3 className="font-medium text-ink-900">{tContact('info.email')}</h3>
                  <a href={`mailto:${garage?.email}`} className="mt-1 text-ink-600 hover:text-accent-600 hover:border-accent-300 transition-colors">{garage?.email}</a>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className={cn(revealDelay(0), 'bg-white border border-ink-200 rounded-2xl p-6')}>
                <h3 className="text-xl font-display font-bold text-ink-900 mb-4">{t('contactTitle')}</h3>
                <ContactForm initialCarId={car.id} carName={`${car.models?.brands?.name} ${car.models?.name}`} />
              </div>

              <div className={cn(revealDelay(1), 'bg-accent-50 border border-accent-100 rounded-2xl p-6')}>
                <h3 className="font-display font-semibold text-ink-900 mb-4">{t('includedServices')}</h3>
                <ul className="space-y-3 text-sm text-ink-700">
                  {INCLUDED_SERVICES.map((service, i) => (
                    <li key={service.label} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-accent-600 shrink-0">
                        <service.icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>{service.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
