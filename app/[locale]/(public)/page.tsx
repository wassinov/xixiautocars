import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CarCard } from '@/components/CarCard';
import { ContactForm } from '@/components/ContactForm';
import { ArrowRight, Truck, Shield, Wrench, CreditCard, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import type { CarWithRelations } from '@/types/car';

export const metadata: Metadata = {
  title: 'Xixi Autocars - Vente de véhicules neufs et d\'occasion',
  description: 'Découvrez notre sélection de véhicules neufs et d\'occasion. Reprise, financement, garantie et entretien. Votre garage de confiance.',
};

const SERVICES = [
  { icon: Truck, title: 'Livraison à domicile', description: 'Nous livrons votre véhicule partout en France métropolitaine.' },
  { icon: Shield, title: 'Garantie 12 mois', description: 'Tous nos véhicules d\'occasion sont garantis 12 mois minimum.' },
  { icon: Wrench, title: 'Entretien & Réparation', description: 'Notre atelier assure l\'entretien et la réparation de votre voiture.' },
  { icon: CreditCard, title: 'Financement sur mesure', description: 'Solutions de financement adaptées à votre budget, avec ou sans apport.' },
  { icon: MapPin, title: 'Reprise de votre ancien véhicule', description: 'Estimation gratuite et reprise cash de votre véhicule actuel.' },
  { icon: ArrowRight, title: 'Démarches administratives', description: 'Nous gérons l\'immatriculation et toutes les formalités pour vous.' },
];

export default async function HomePage() {
  const supabase = await createClient();

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
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single(),
    ]);

    const featuredCars = result[0].data;
    const garage = result[1].data;

    // `models` est une relation plusieurs-vers-un : Supabase retourne un OBJET unique
    // (models.brands est lui-même un objet unique). La ligne est passée telle quelle
    // à CarCard, qui lit car.models?.name / car.models?.brands?.name / car.car_images (tableau).
    const transformedFeaturedCars = (featuredCars || []) as CarWithRelations[];

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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="container-custom py-20 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 text-sm font-medium text-primary-700 bg-primary-50 rounded-full mb-4">
              Garage familial depuis 1980
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
              Votre prochain véhicule <span className="text-primary-600">vous attend</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-600 max-w-2xl">
              Large choix de véhicules neufs et d'occasion, révisés et garantis. Reprise, financement et livraison à domicile.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                Voir le catalogue
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
      </section>

      {/* Védettes */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Nos véhicules vedettes</h2>
              <p className="mt-2 text-neutral-600">Sélectionnés pour vous, disponibles immédiatement</p>
            </div>
            <Link href="/catalogue" className="hidden sm:inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
              Voir tout le catalogue
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {transformedFeaturedCars && transformedFeaturedCars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {transformedFeaturedCars.map((car, i) => (
                <CarCard key={car.id} car={car} priority={i < 2} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-50 rounded-xl">
              <p className="text-neutral-600">Aucun véhicule vedette pour le moment.</p>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link href="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              Voir tout le catalogue
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">Nos services</h2>
            <p className="mt-3 text-neutral-600">Tout pour simplifier votre achat et l'entretien de votre véhicule</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <article key={i} className="p-6 bg-white rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                  <service.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">{service.title}</h3>
                <p className="mt-2 text-neutral-600">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Contact */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="bg-primary-600 rounded-2xl p-8 lg:p-12 text-center text-white">
              <h2 className="text-2xl lg:text-3xl font-bold">Prêt à trouver votre véhicule ?</h2>
              <p className="mt-3 text-primary-100">Contactez-nous pour un essai, une reprise ou simplement pour un conseil.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className="w-full sm:w-auto px-6 py-3 text-base font-medium text-primary-600 bg-white rounded-lg hover:bg-primary-50 transition-colors">
                  Nous contacter
                </Link>
                <Link href="/catalogue" className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-primary-700 rounded-lg hover:bg-primary-800 transition-colors">
                  Parcourir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infos Garage */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-neutral-900">{garageInfo.name}</h2>
              <p className="mt-4 text-neutral-600 whitespace-pre-line">{garageInfo.about_text}</p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-neutral-900">Adresse</h3>
                    <p className="text-neutral-600">{garageInfo.address}</p>
                    {garageInfo.google_maps_url && (
                      <a href={garageInfo.google_maps_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                        Voir sur Google Maps
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-neutral-900">Horaires</h3>
                    <p className="text-neutral-600 whitespace-pre-line">{garageInfo.opening_hours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-neutral-900">Téléphone</h3>
                    <a href={`tel:${garageInfo.phone.replace(/\s/g, '')}`} className="text-neutral-600 hover:text-primary-600">{garageInfo.phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-neutral-900">Email</h3>
                    <a href={`mailto:${garageInfo.email}`} className="text-neutral-600 hover:text-primary-600">{garageInfo.email}</a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-neutral-900">Nous contacter</h3>
              <p className="mt-2 text-neutral-600">Une question ? Un projet ? Nous vous répondrons sous 24h.</p>
              <ContactForm carName="véhicule" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
