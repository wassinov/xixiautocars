import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CarCard } from '@/components/CarCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { MobileFilters } from '@/components/MobileFilters';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from '@/i18n'; // BUG-20 : liens auto-préfixés selon la locale (as-needed)
import type { CarWithRelations } from '@/types/car';
import { cn } from '@/lib/utils';
import { magazineContainer, revealDelay } from '@/lib/utils';
import { languagesAlternates } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('catalog');
  return {
    title: `${t('title')} - Xixi Autocars`,
    description: 'Parcourez notre catalogue de véhicules neufs et d\'occasion. Filtres par marque, modèle, prix, carburant, kilométrage...',
    alternates: { languages: languagesAlternates('/catalogue') }, // BUG-24 : hreflang × 4 locales
  };
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
  if (searchParams.model) query = query.eq('models.id', searchParams.model); // BUG-08 : le filtre Modèle cible models.id (FK de cars.model_id), pas brand_id
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

  const transformedCars = (data || []) as unknown as CarWithRelations[]; // BUG-07 : to-one = objet au runtime

  return { cars: transformedCars, total: count || 0, page, totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE) };
}

// BUG-09 : options de filtres réelles (marques/modèles) pour la sidebar
async function getFilterOptions() {
  const supabase = await createClient();
  const [{ data: brands }, { data: models }] = await Promise.all([
    supabase.from('brands').select('id, name').order('name'),
    supabase.from('models').select('id, name, brand_id').order('name'),
  ]);
  return {
    brands: (brands ?? []) as { id: string; name: string }[],
    models: (models ?? []) as { id: string; name: string; brand_id: string }[],
  };
}

export default async function CataloguePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const t = await getTranslations('catalog');
  const params = await searchParams;
  const { cars, total, page, totalPages } = await getCars(params);
  const { brands, models } = await getFilterOptions(); // BUG-09

  const hasFilters = Object.keys(params).some((k) => k !== 'page' && k !== 'sort');

  const createPageUrl = (newPage: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (k !== 'page' && v) sp.set(k, v); });
    if (newPage > 1) sp.set('page', String(newPage));
    return `/catalogue?${sp.toString()}`;
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className={magazineContainer('py-section lg:py-section-lg')}>
        <header className="mb-10">
          <h1 className="text-3xl font-display font-bold text-ink-900 animate-reveal">{t('title')}</h1>
          <p className="mt-2 text-body-lg text-ink-600 animate-reveal delay-100">
            {t('results', { count: total })}
          </p>
        </header>

        {hasFilters && (
          <div className="mb-8 animate-reveal">
            <Link href="/catalogue" className="inline-flex items-center gap-2 text-sm font-medium text-accent-600 hover:text-accent-700 hover:border-accent-300 transition-colors">
              <X className="h-4 w-4" />
              {t('clear')}
            </Link>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <MobileFilters brands={brands} models={models} />
          <FilterSidebar brands={brands} models={models} />

          <div className="flex-1 min-w-0">
            {cars.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {cars.map((car, i) => (
                    <CarCard key={car.id} car={car} priority={i < 4} className={cn(revealDelay(i), 'hover:border-accent-300')} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                    {page > 1 && (
                      <Link
                        href={createPageUrl(page - 1)}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700',
                          'bg-white border border-ink-300 rounded-md',
                          'hover:bg-ink-50 hover:border-ink-400 hover:border-accent-300 transition-colors duration-200'
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('prev')}
                      </Link>
                    )}

                    <span className="px-4 py-2.5 text-sm font-medium text-ink-600">
                      {t('page', { current: page, total: totalPages })}
                    </span>

                    {page < totalPages && (
                      <Link
                        href={createPageUrl(page + 1)}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700',
                          'bg-white border border-ink-300 rounded-md',
                          'hover:bg-ink-50 hover:border-ink-400 hover:border-accent-300 transition-colors duration-200'
                        )}
                      >
                        {t('next')}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-ink-200 animate-reveal">
                <p className="text-ink-600 mb-4">{t('noResults')}</p>
                <Link href="/catalogue" className="inline-flex items-center gap-2 text-accent-600 font-medium hover:text-accent-700 hover:border-accent-300 transition-colors">
                  <X className="h-4 w-4" />
                  {t('clearFilters')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}