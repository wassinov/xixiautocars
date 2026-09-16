'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Car, Plus, Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

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
  models: {
    id: string;
    name: string;
    body_type: string | null;
    brands: { id: string; name: string };
  };
  car_images: { image_url: string; is_primary: boolean }[];
}

interface BrandData { id: string; name: string; }

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export default function CarsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin.cars');
  const tCommon = useTranslations('common');

  const [cars, setCars] = useState<CarData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCars = async () => {
    const supabase = createClient();
    const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
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

    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const isNew = searchParams.get('is_new');
    const isFeatured = searchParams.get('is_featured');
    const isAvailable = searchParams.get('is_available');

    if (search) {
      query = query.or(`models.brands.name.ilike.%${search}%,models.name.ilike.%${search}%`);
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

    setCars(data || []);
    setTotal(count || 0);
    setPage(currentPage);
    setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
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
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(Object.fromEntries(sp.entries())).forEach(([k, v]) => { if (k !== 'page' && v) sp.set(k, v); });
    if (newPage > 1) sp.set('page', String(newPage));
    else sp.delete('page');
    return `/${locale}/dashboard/cars?${sp.toString()}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (e.target.value) sp.set('search', e.target.value);
    else sp.delete('search');
    sp.delete('page');
    router.push(`/${locale}/dashboard/cars?${sp.toString()}`);
  };

  const handleSelectChange = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete('page');
    router.push(`/${locale}/dashboard/cars?${sp.toString()}`);
  };

  const hasFilters = Array.from(searchParams.entries()).some(([k]) => k !== 'page');

  const handleDelete = (carId: string) => {
    if (confirm(tCommon('confirmDelete'))) {
      router.push(`/${locale}/dashboard/cars/${carId}/delete`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-1 text-neutral-600">{tCommon('total')} {total} {tCommon('vehicles')}</p>
        </div>
        <Link href={`/${locale}/dashboard/cars/new`}>
          <Button><Plus className="mr-2 h-4 w-4" />{t('addNew')}</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder={t('search')}
            value={searchParams.get('search') || ''}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        <Select
          value={searchParams.get('brand') || ''}
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
          value={searchParams.get('is_new') || ''}
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
          value={searchParams.get('is_featured') || ''}
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
          value={searchParams.get('is_available') || ''}
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
          <a href={`/${locale}/dashboard/cars`} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 self-end">
            <Filter className="h-4 w-4" />
            {t('clearFilters')}
          </a>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">{t('table.image')}</TableHead>
              <TableHead>{t('table.vehicle')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('table.year')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('table.mileage')}</TableHead>
              <TableHead className="text-right">{t('table.price')}</TableHead>
              <TableHead className="w-48">{t('table.status')}</TableHead>
              <TableHead className="w-48">{t('table.date')}</TableHead>
              <TableHead className="w-56 text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-neutral-500">{tCommon('noData')}</TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>
                    {car.car_images?.[0] ? (
                      <img src={car.car_images[0].image_url} alt="" className="w-20 h-15 rounded-lg object-cover" />
                    ) : (
                      <div className="w-20 h-15 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-neutral-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-neutral-900">{car.models?.brands?.name} {car.models?.name}</p>
                      <p className="text-sm text-neutral-500">{car.models?.body_type || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{car.year}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {car.mileage ? car.mileage.toLocaleString('fr-FR') + ' km' : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-neutral-900">{formatPrice(car.price, car.currency)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {car.is_new && <Badge variant="success" className="text-xs">{t('statuses.new')}</Badge>}
                      {car.is_featured && <Badge variant="default" className="text-xs">{t('statuses.featured')}</Badge>}
                      {!car.is_available && <Badge variant="destructive" className="text-xs">{t('statuses.sold')}</Badge>}
                      {car.is_available && !car.is_new && !car.is_featured && <Badge variant="secondary" className="text-xs">{t('statuses.available')}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-500">{format(new Date(car.created_at), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/dashboard/cars/${car.id}`}><Eye className="mr-2 h-4 w-4" />{t('actions.view')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/dashboard/cars/${car.id}/edit`}><Edit className="mr-2 h-4 w-4" />{t('actions.edit')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/dashboard/cars/${car.id}/images`}><ImageIcon className="mr-2 h-4 w-4" />{t('actions.images')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(car.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />{t('actions.delete')}
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
            <a href={createPageUrl(page - 1)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50">
              <ChevronLeft className="h-4 w-4 inline-block mr-1" /> {t('pagination.prev')}
            </a>
          )}
          <span className="px-4 py-2 text-sm font-medium text-neutral-600">{t('pagination.page', { current: page, total: totalPages })}</span>
          {page < totalPages && (
            <a href={createPageUrl(page + 1)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50">
              {t('pagination.next')} <ChevronRight className="h-4 w-4 inline-block ml-1" />
            </a>
          )}
        </nav>
      )}
    </div>
  );
}