import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CarCard } from '@/components/CarCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import Link from 'next/link';
import type { CarWithRelations } from '@/types/car';

export const metadata: Metadata = {
  title: 'Catalogue - Xixi Autocars',
  description: 'Parcourez notre catalogue de véhicules neufs et d\'occasion. Filtres par marque, modèle, prix, carburant, kilométrage...',
};

const ITEMS_PER_PAGE = 12;

interface SearchParams {
  page?: string;
  brand?: string;
  model?: string;
  body_type?: string;
  fuel_type?: string;
  gearbox?: string;
  min_price?: string;
  max_price?: string;
  min_year?: string;
  max_year?: string;
  min_mileage?: string;
  max_mileage?: string;
  is_new?: string;
  is_featured?: string;
  sort?: string;
}

async function getCars(searchParams: SearchParams) {
  const supabase = await createClient();
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('cars')
    .select(`
      id, is_new, year, mileage, price, currency, color, gearbox, fuel_type, is_featured, created_at,
      models (
        id, name, body_type,
        brands (id, name)
      ),
      car_images (image_url, is_primary)
    `, { count: 'exact' })
    .eq('is_available', true)
    .range(from, to)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (searchParams.brand) query = query.eq('models.brand_id', searchParams.brand);
  if (searchParams.model) query = query.eq('model_id', searchParams.model);
  if (searchParams.body_type) query = query.eq('models.body_type', searchParams.body_type);
  if (searchParams.fuel_type) query = query.eq('fuel_type', searchParams.fuel_type);
  if (searchParams.gearbox) query = query.eq('gearbox', searchParams.gearbox);
  if (searchParams.min_price) query = query.gte('price', parseFloat(searchParams.min_price));
  if (searchParams.max_price) query = query.lte('price', parseFloat(searchParams.max_price));
  if (searchParams.min_year) query = query.gte('year', parseInt(searchParams.min_year, 10));
  if (searchParams.max_year) query = query.lte('year', parseInt(searchParams.max_year, 10));
  if (searchParams.min_mileage) query = query.gte('mileage', parseInt(searchParams.min_mileage, 10));
  if (searchParams.max_mileage) query = query.lte('mileage', parseInt(searchParams.max_mileage, 10));
  if (searchParams.is_new === 'true') query = query.eq('is_new', true);
  if (searchParams.is_featured === 'true') query = query.eq('is_featured', true);

  const { data, error, count } = await query;
  if (error) throw error;

  // `models` est une relation plusieurs-vers-un : Supabase retourne un OBJET unique
  // (models.brands est lui-même un objet unique). La ligne est passée telle quelle
  // à CarCard, qui lit car.models?.name / car.models?.brands?.name / car.car_images (tableau).
  const transformedCars = (data || []) as CarWithRelations[];

  return { cars: transformedCars, total: count || 0, page, totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE) };
}

async function getBrands() {
  const supabase = await createClient();
  const { data } = await supabase.from('brands').select('id, name').order('name');
  return data || [];
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export default async function CataloguePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { cars, total, page, totalPages } = await getCars(params);
  const brands = await getBrands();

  const hasFilters = Object.keys(params).some((k) => k !== 'page' && k !== 'sort');

  const createPageUrl = (newPage: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (k !== 'page' && v) sp.set(k, v); });
    if (newPage > 1) sp.set('page', String(newPage));
    return `/catalogue?${sp.toString()}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-custom py-10 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">Notre catalogue</h1>
          <p className="mt-2 text-neutral-600">{total} véhicule{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar />

          <div className="flex-1">
            {hasFilters && (
              <div className="hidden lg:block mb-6 flex items-center gap-2 text-sm text-neutral-600 bg-white p-3 rounded-lg border">
                <span>Filtres actifs</span>
                <Link href="/catalogue" className="ml-auto text-primary-600 hover:text-primary-700 font-medium">
                  Tout effacer
                </Link>
              </div>
            )}

            {cars.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {cars.map((car, i) => (
                    <CarCard key={car.id} car={car} priority={i < 4} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                    {page > 1 && (
                      <Link href={createPageUrl(page - 1)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                        <ChevronLeft className="h-4 w-4 inline-block mr-1" />
                        Précédent
                      </Link>
                    )}

                    <span className="px-4 py-2 text-sm font-medium text-neutral-600">
                      Page {page} sur {totalPages}
                    </span>

                    {page < totalPages && (
                      <Link href={createPageUrl(page + 1)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                        Suivant
                        <ChevronRight className="h-4 w-4 inline-block ml-1" />
                      </Link>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border">
                <p className="text-neutral-600 mb-4">Aucun véhicule ne correspond à vos critères.</p>
                <Link href="/catalogue" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
                  <X className="h-4 w-4" />
                  Réinitialiser les filtres
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
