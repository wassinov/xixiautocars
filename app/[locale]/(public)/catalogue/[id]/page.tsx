import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ImageGallery } from '@/components/ImageGallery';
import { ContactForm } from '@/components/ContactForm';
import { Calendar, MapPin, Fuel, Settings, Tag, Truck, Shield, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { CarWithRelations } from '@/types/car';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: car } = await supabase
    .from('cars')
    .select('models (name, brands (name)), year, price, currency')
    .eq('id', id)
    .single();

  if (!car) return { title: 'Véhicule introuvable' };

  // `models` est une relation plusieurs-vers-un : objet unique, jamais un tableau.
  const brandName = car.models?.brands?.name;
  const modelName = car.models?.name;

  return {
    title: `${brandName} ${modelName} (${car.year}) - ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: car.currency, maximumFractionDigits: 0 }).format(car.price)}`,
    description: `${brandName} ${modelName} ${car.year} - ${car.price.toLocaleString('fr-FR')} ${car.currency}. Véhicule disponible chez Xixi Autocars.`,
    openGraph: {
      title: `${brandName} ${modelName} (${car.year})`,
      description: `Prix: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: car.currency, maximumFractionDigits: 0 }).format(car.price)}`,
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
  return data as CarWithRelations;
}

async function getGarage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('garage_infos')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
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

const SPECS: SpecConfig[] = [
  { key: 'year', label: 'Année', icon: Calendar },
  { key: 'mileage', label: 'Kilométrage', icon: MapPin, format: (v: number) => v.toLocaleString('fr-FR') + ' km' },
  { key: 'fuel_type', label: 'Carburant', icon: Fuel },
  { key: 'gearbox', label: 'Boîte', icon: Settings },
  { key: 'color', label: 'Couleur', icon: Tag },
  { key: 'body_type', label: 'Carrosserie', icon: Truck, nested: 'models' },
];

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [car, garage] = await Promise.all([getCar(id), getGarage()]);

  if (!car) notFound();

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: car.currency, maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-40" aria-label="Fil d'Ariane">
        <div className="container-custom py-3">
          <ol className="flex items-center gap-2 text-sm text-neutral-500">
            <li><Link href="/" className="hover:text-primary-600">Accueil</Link></li>
            <li className="text-neutral-300">/</li>
            <li><Link href="/catalogue" className="hover:text-primary-600">Catalogue</Link></li>
            <li className="text-neutral-300">/</li>
            <li className="text-neutral-900 font-medium truncate max-w-[200px]">{car.models?.brands?.name} {car.models?.name}</li>
          </ol>
        </div>
      </nav>

      <main className="container-custom py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {car.is_new && <span className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-full">Neuf</span>}
            {car.is_featured && <span className="px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-full">Vedette</span>}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">{car.models?.brands?.name} {car.models?.name}</h1>
          <p className="mt-2 text-2xl lg:text-3xl font-bold text-primary-700">{formatPrice(car.price)}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section aria-labelledby="gallery-title">
              <ImageGallery images={car.car_images} carName={`${car.models?.brands?.name} ${car.models?.name}`} />
            </section>

            <section aria-labelledby="specs-title">
              <h2 id="specs-title" className="text-xl font-bold text-neutral-900 mb-4">Caractéristiques techniques</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SPECS.map((spec) => {
                  const source = spec.nested ? car[spec.nested as keyof typeof car] : car;
                  const value = source?.[spec.key as keyof typeof source];
                  if (value === null || value === undefined || value === '') return null;
                  const Icon = spec.icon;
                  return (
                    <div key={spec.key} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                      <Icon className="h-5 w-5 text-primary-600 shrink-0" aria-hidden="true" />
                      <div>
                        <dt className="text-sm text-neutral-500">{spec.label}</dt>
                        <dd className="text-base font-medium text-neutral-900">
                          {spec.format ? spec.format(value as number) : String(value)}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </section>

            {car.description && (
              <section aria-labelledby="desc-title">
                <h2 id="desc-title" className="text-xl font-bold text-neutral-900 mb-4">Description</h2>
                <div className="prose prose-neutral max-w-none whitespace-pre-line text-neutral-700">
                  {car.description}
                </div>
              </section>
            )}

            {car.features && Object.keys(car.features).length > 0 && (
              <section aria-labelledby="features-title">
                <h2 id="features-title" className="text-xl font-bold text-neutral-900 mb-4">Équipements & Options</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(car.features).map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" aria-hidden="true" />
                      <span>{key.replace(/_/g, ' ')}</span>
                      {value !== true && <span className="text-neutral-500">: {String(value)}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="garage-title">
              <h2 id="garage-title" className="text-xl font-bold text-neutral-900 mb-4">{garage?.name || 'Xixi Autocars'}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h3 className="font-medium text-neutral-900">Adresse</h3>
                  <p className="mt-1 text-neutral-600">{garage?.address}</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h3 className="font-medium text-neutral-900">Horaires</h3>
                  <p className="mt-1 text-neutral-600 whitespace-pre-line">{garage?.opening_hours}</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h3 className="font-medium text-neutral-900">Téléphone</h3>
                  <a href={`tel:${garage?.phone?.replace(/\s/g, '')}`} className="mt-1 text-neutral-600 hover:text-primary-600">{garage?.phone}</a>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h3 className="font-medium text-neutral-900">Email</h3>
                  <a href={`mailto:${garage?.email}`} className="mt-1 text-neutral-600 hover:text-primary-600">{garage?.email}</a>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Contactez-nous pour ce véhicule</h3>
                <ContactForm initialCarId={car.id} carName={`${car.models?.brands?.name} ${car.models?.name}`} />
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-6">
                <h3 className="font-bold text-neutral-900 mb-3">Services inclus</h3>
                <ul className="space-y-3 text-sm text-neutral-700">
                  <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary-600" /><span>Garantie 12 mois minimum</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary-600" /><span>Véhicule révisé et contrôlé</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary-600" /><span>Démarches administratives offertes</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary-600" /><span>Livraison possible à domicile</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary-600" /><span>Reprise de votre ancien véhicule</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary-600" /><span>Solutions de financement</span></li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
