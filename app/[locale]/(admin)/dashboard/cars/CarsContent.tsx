'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Car, Plus, Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Link, useRouter } from '@/i18n'; // BUG-20 : liens + navigation auto-préfixés
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { formatPrice, formatMileage, safeIlikePattern, dateFnsLocale } from '@/lib/utils';

const ITEMS_PER_PAGE = 15;

interface CarData {
  id: string;
  is_new: boolean;
  is_featured: boolean;
  is_available: boolean;
  year: number;
  mileage: number | null;
  price: number;
  currency: string;
  color: string | null;
  gearbox: string | null;
  fuel_type: string | null;
  created_at: string;
  models: { // BUG-07 : to-one → PostgREST renvoie un OBJET
    id: string;
    name: string;
    body_type: string | null;
    brands: { id: string; name: string };
  } | null;
  car_images: { image_url: string; is_primary: boolean }[];
}

interface BrandData { id: string; name: string; }

interface SearchParams {
  page?: string;
  search?: string;
  brand?: string;
  is_new?: string;
  is_featured?: string;
  is_available?: string;
}

interface CarsContentProps {
  searchParams: SearchParams;
}

export default function CarsContent({ searchParams }: CarsContentProps) {
  const router = useRouter();
  const locale = useLocale(); // BUG-22 : formats prix/km/dates localisés
  const t = useTranslations('admin.cars');
  const tCommon = useTranslations('common');

  const [cars, setCars] = useState<CarData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  // BUG-15 : champ de recherche local — la navigation est débounce, plus de push à chaque frappe
  const [searchInput, setSearchInput] = useState(searchParams.search || '');

  const fetchCars = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('cars')
        .select(`
          id, is_new, is_featured, is_available, year, mileage, price, currency, color, gearbox, fuel_type, created_at,
          models (id, name, body_type, brands (id, name)),
          car_images (image_url, is_primary)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      const search = searchParams.search;
      const brand = searchParams.brand;
      const isNew = searchParams.is_new;
      const isFeatured = searchParams.is_featured;
      const isAvailable = searchParams.is_available;

      if (search) {
        // BUG-16 : motif cité → impossible d'injecter des conditions via la recherche
        const pattern = safeIlikePattern(search);
        query = query.or(`models.brands.name.ilike.${pattern},models.name.ilike.${pattern}`);
      }
      if (brand) query = query.eq('models.brand_id', brand);
      if (isNew === 'true') query = query.eq('is_new', true);
      if (isNew === 'false') query = query.eq('is_new', false);
      if (isFeatured === 'true') query = query.eq('is_featured', true);
      if (isFeatured === 'false') query = query.eq('is_featured', false);
      if (isAvailable === 'true') query = query.eq('is_available', true);
      if (isAvailable === 'false') query = query.eq('is_available', false);

      const { data, error, count } = await query;
      if (error) throw error;

      setCars(data as unknown as CarData[]); // BUG-07 : to-one = objet au runtime — l'inférence par défaut de postgrest (tableau) n'est qu'une supposition sans schéma typé
      setTotal(count || 0);
      setPage(currentPage);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Erreur fetchCars:', err);
      toast({ title: tCommon('error'), description: tCommon('loadError'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('brands').select('id, name').order('name');
    setBrands(data || []);
  };

  useEffect(() => {
    fetchCars();
    fetchBrands();
  }, [searchParams]);

  const createPageUrl = (newPage: number) => {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (k !== 'page' && v) sp.set(k, v); });
    if (newPage > 1) sp.set('page', String(newPage));
    return `/dashboard/cars?${sp.toString()}`;
  };

  // BUG-15 : la recherche vit dans un état local ; la navigation ne part qu'après 400 ms sans frappe
  useEffect(() => {
    if (searchInput === (searchParams.search || '')) return; // montage ou URL déjà à jour : rien à pousser

    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => { if (k !== 'page' && k !== 'search' && v) sp.set(k, v); });
      if (searchInput) sp.set('search', searchInput);
      router.push(`/dashboard/cars?${sp.toString()}`);
    }, 400);

    return () => clearTimeout(timer); // chaque frappe annule le timer précédent
  }, [searchInput, searchParams, locale, router]);

  // BUG-15 : resynchronise le champ si l'URL change (reset des filtres, lien direct…)
  useEffect(() => {
    setSearchInput(searchParams.search || '');
  }, [searchParams.search]);

  const handleSelectChange = (key: string, value: string) => {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (k !== 'page' && k !== 'search' && v) sp.set(k, v); });
    if (searchInput) sp.set('search', searchInput); // BUG-15 : préserve la recherche en cours de frappe
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete('page');
    router.push(`/dashboard/cars?${sp.toString()}`);
  };

  const hasFilters = Object.entries(searchParams).some(([k]) => k !== 'page');

  const handleDelete = async (carId: string) => {
    if (!confirm(tCommon('confirmDelete'))) return;

    const supabase = createClient();

    const { data: images } = await supabase
      .from('car_images')
      .select('image_url')
      .eq('car_id', carId);

    const { error } = await supabase.from('cars').delete().eq('id', carId);

    if (error) {
      toast({ title: tCommon('error'), description: tCommon('deleteError'), variant: 'destructive' });
      return;
    }

    if (images && images.length > 0) {
      const paths = images.map(img => img.image_url.split('/car-images/')[1]).filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from('car-images').remove(paths);
      }
    }

    toast({ title: tCommon('success'), description: tCommon('deleted') });
    fetchCars();
  };

  const StatusBadge = ({ car }: { car: CarData }) => (
    <div className="flex flex-wrap gap-1">
      {car.is_new && <Badge variant="sage" className="text-xs">{t('statuses.new')}</Badge>}
      {car.is_featured && <Badge variant="accent" className="text-xs">{t('statuses.featured')}</Badge>}
      {!car.is_available && <Badge variant="terracotta" className="text-xs">{t('statuses.sold')}</Badge>}
      {car.is_available && !car.is_new && !car.is_featured && <Badge variant="default" className="text-xs">{t('statuses.available')}</Badge>}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">{t('title')}</h1>
          <p className="mt-1 text-base text-ink-600">{tCommon('total')} {total} {tCommon('vehicles')}</p>
        </div>
        <Link href="/dashboard/cars/new">
          <Button className="hover:border-accent-300"><Plus className="mr-2 h-4 w-4" />{t('addNew')}</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            placeholder={t('search')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={searchParams.brand || ''}
          onValueChange={(v) => handleSelectChange('brand', v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('allBrands')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allBrands')}</SelectItem>
            {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.is_new || ''}
          onValueChange={(v) => handleSelectChange('is_new', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('condition')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allConditions')}</SelectItem>
            <SelectItem value="true">{t('new')}</SelectItem>
            <SelectItem value="false">{t('used')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.is_featured || ''}
          onValueChange={(v) => handleSelectChange('is_featured', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('featured')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allFeatured')}</SelectItem>
            <SelectItem value="true">{t('featuredYes')}</SelectItem>
            <SelectItem value="false">{t('featuredNo')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.is_available || ''}
          onValueChange={(v) => handleSelectChange('is_available', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('availability')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allAvailability')}</SelectItem>
            <SelectItem value="true">{t('available')}</SelectItem>
            <SelectItem value="false">{t('sold')}</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Link href="/dashboard/cars" className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:border-accent-300 hover:text-accent-700 self-end transition-colors">
            <Filter className="h-4 w-4" />
            {t('clearFilters')}
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-ink-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-ink-200 bg-ink-50">
              <TableHead className="w-24 text-left">{t('table.image')}</TableHead>
              <TableHead className="text-left">{t('table.vehicle')}</TableHead>
              <TableHead className="hidden md:table-cell text-left">{t('table.year')}</TableHead>
              <TableHead className="hidden lg:table-cell text-left">{t('table.mileage')}</TableHead>
              <TableHead className="text-right">{t('table.price')}</TableHead>
              <TableHead className="w-48 text-left">{t('table.status')}</TableHead>
              <TableHead className="w-48 text-left">{t('table.date')}</TableHead>
              <TableHead className="w-56 text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-ink-500">{tCommon('noData')}</TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.id} className="border-b border-ink-100 hover:bg-ink-50 transition-colors">
                  <TableCell className="p-4">
                    {car.car_images?.[0] ? (
                      <img src={car.car_images[0].image_url} alt="" className="w-20 h-[3.75rem] rounded-lg object-cover" />
                    ) : (
                      <div className="w-20 h-[3.75rem] rounded-lg bg-ink-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-ink-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-4">
                    <div>
                      <p className="font-medium text-ink-900">{car.models?.brands?.name} {car.models?.name}</p>
                      <p className="text-sm text-ink-500">{car.models?.body_type || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-4 text-sm text-ink-600">{car.year}</TableCell>
                  <TableCell className="hidden lg:table-cell p-4 text-sm text-ink-600 font-mono">{formatMileage(car.mileage, locale)}</TableCell>
                  <TableCell className="p-4 text-right font-display font-semibold text-terracotta-600 font-mono">{formatPrice(car.price, car.currency, locale)}</TableCell>
                  <TableCell className="p-4">
                    <StatusBadge car={car} />
                  </TableCell>
                  <TableCell className="p-4 text-sm text-ink-500">{format(new Date(car.created_at), 'dd/MM/yyyy', { locale: dateFnsLocale(locale) })}</TableCell>
                  <TableCell className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-9 w-9 rounded-lg p-1 hover:bg-ink-100 hover:border-accent-300 transition-colors" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4 text-ink-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-ink-200">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/cars/${car.id}`} className="flex items-center gap-2 text-sm text-ink-700 hover:bg-accent-50 hover:text-accent-700 hover:border-accent-300 px-3 py-2 rounded-lg">
                            <Eye className="h-4 w-4" />
                            {t('actions.view')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/cars/${car.id}`} className="flex items-center gap-2 text-sm text-ink-700 hover:bg-accent-50 hover:text-accent-700 hover:border-accent-300 px-3 py-2 rounded-lg">
                            <Edit className="h-4 w-4" />
                            {t('actions.edit')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-ink-200" />
                        <DropdownMenuItem className="text-terracotta-600 focus:text-terracotta-600 hover:bg-terracotta-50 hover:border-accent-300" onClick={() => handleDelete(car.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link href={createPageUrl(page - 1)} className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700',
              'bg-white border border-ink-300 rounded-lg',
              'hover:bg-ink-50 hover:border-accent-300 transition-colors duration-200'
            )}>
              <ChevronLeft className="h-4 w-4" /> {t('pagination.prev')}
            </Link>
          )}

          <span className="px-4 py-2.5 text-sm font-medium text-ink-600">{t('pagination.page', { current: page, total: totalPages })}</span>

          {page < totalPages && (
            <Link href={createPageUrl(page + 1)} className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700',
              'bg-white border border-ink-300 rounded-lg',
              'hover:bg-ink-50 hover:border-accent-300 transition-colors duration-200'
            )}>
              {t('pagination.next')} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}