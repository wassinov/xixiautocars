import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ContactForm } from '@/components/ContactForm';
import { MapPin, Phone, Mail, Clock, Map } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact - Xixi Autocars',
  description: 'Contactez Xixi Autocars pour toute demande d\'information, essai véhicule, financement ou reprise. Réponse sous 24h.',
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: garage } = await supabase
    .from('garage_infos')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
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
    <div className="min-h-screen bg-white">
      <section className="bg-primary-600 text-white py-16 lg:py-24">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">Contactez-nous</h1>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
            Une question sur un véhicule ? Besoin d'un financement ? Envie d'essayer une voiture ?
            Notre équipe vous répond sous 24h.
          </p>
        </div>
      </section>

      <main className="container-custom py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Envoyez-nous un message</h2>
            <ContactForm />
          </div>

          <aside className="space-y-8">
            <div className="bg-neutral-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Informations pratiques</h3>
              <dl className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-sm font-medium text-neutral-700">Adresse</dt>
                    <dd className="mt-1 text-neutral-600">{garageInfo.address}</dd>
                    {garageInfo.google_maps_url && (
                      <a href={garageInfo.google_maps_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                        <Map className="h-3.5 w-3.5" />
                        Itinéraire
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-sm font-medium text-neutral-700">Téléphone</dt>
                    <dd className="mt-1"><a href={`tel:${garageInfo.phone.replace(/\s/g, '')}`} className="text-neutral-600 hover:text-primary-600">{garageInfo.phone}</a></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-sm font-medium text-neutral-700">Email</dt>
                    <dd className="mt-1"><a href={`mailto:${garageInfo.email}`} className="text-neutral-600 hover:text-primary-600">{garageInfo.email}</a></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-sm font-medium text-neutral-700">Horaires d'ouverture</dt>
                    <dd className="mt-1 text-neutral-600 whitespace-pre-line">{garageInfo.opening_hours}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="bg-primary-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Besoin d'une réponse rapide ?</h3>
              <p className="text-primary-100 mb-4">Appelez-nous directement aux horaires d'ouverture, nous serons ravis de vous renseigner.</p>
              <a href={`tel:${garageInfo.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 bg-white font-medium rounded-lg hover:bg-primary-50 transition-colors">
                <Phone className="h-5 w-5" />
                Appeler maintenant
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}