'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// BUG-23 (Étape 30) : `value` = valeur brute stockée en DB (elle pilote les requêtes PostgREST — ne pas traduire) ;
// `key` = clé i18n sous catalog.fuels/gearboxes/bodyTypes pour le LIBELLÉ affiché (traduit ×4).
const FUEL_TYPES = [
  { value: 'Essence', key: 'gasoline' },
  { value: 'Diesel', key: 'diesel' },
  { value: 'Hybride', key: 'hybrid' },
  { value: 'Électrique', key: 'electric' },
  { value: 'GPL', key: 'lpg' },
  { value: 'E85', key: 'e85' },
] as const;

const GEARBOX_TYPES = [
  { value: 'Manuelle', key: 'manual' },
  { value: 'Automatique', key: 'automatic' },
  { value: 'Séquentielle', key: 'sequential' },
] as const;

const BODY_TYPES = [
  { value: 'Berline', key: 'sedan' },
  { value: 'SUV', key: 'suv' },
  { value: 'Break', key: 'wagon' },
  { value: 'Citadine', key: 'city' },
  { value: 'Coupé', key: 'coupe' },
  { value: 'Cabriolet', key: 'convertible' },
  { value: 'Utilitaire', key: 'utility' },
  { value: 'Monospace', key: 'minivan' },
] as const;

interface BrandOption {
  id: string;
  name: string;
}

interface ModelOption {
  id: string;
  name: string;
  brand_id: string;
}

interface FilterSidebarProps {
  /** BUG-09 : marques réelles (fetch côté serveur, passées par la page) */
  brands: BrandOption[];
  /** BUG-09 : modèles réels (fetch côté serveur, passées par la page) */
  models: ModelOption[];
  /** BUG-21 : classes du <aside> — défaut desktop (hidden lg:block) ; MobileFilters passe w-full */
  className?: string;
}

export function FilterSidebar({ brands, models, className }: FilterSidebarProps) {
  const t = useTranslations('catalog'); // BUG-23 (Étape 30) : filtres traduits ×4 locales
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const createQueryString = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '') sp.delete(key);
      else sp.set(key, value);
    });
    return sp.toString();
  };

  const setParam = (key: string, value: string | undefined) => {
    router.push(`${pathname}?${createQueryString({ [key]: value })}`);
  };

  const setMultiple = (params: Record<string, string | undefined>) => {
    router.push(`${pathname}?${createQueryString(params)}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters = Array.from(searchParams.entries()).some(([k]) => k !== 'page');

  const selectedBrand = searchParams.get('brand') || '';
  const selectedModel = searchParams.get('model') || '';
  const selectedBodyType = searchParams.get('body_type') || '';
  const selectedFuel = searchParams.get('fuel_type') || '';
  const selectedGearbox = searchParams.get('gearbox') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const minYear = searchParams.get('min_year') || '';
  const maxYear = searchParams.get('max_year') || '';
  const minMileage = searchParams.get('min_mileage') || '';
  const maxMileage = searchParams.get('max_mileage') || '';
  const isNew = searchParams.get('is_new') === 'true';
  const isFeatured = searchParams.get('is_featured') === 'true';

  const filteredModels = selectedBrand ? models.filter((m) => m.brand_id === selectedBrand) : models;

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="text-sm text-ink-700 font-body uppercase tracking-wider">{title}</label>
      {children}
    </div>
  );

  return (
    <aside className={className ?? 'hidden lg:block w-80 flex-shrink-0'}>
      <div className="sticky top-24 space-y-6 p-5 bg-white rounded-2xl border border-ink-200">
        <div className="flex items-center justify-between border-b border-ink-200 pb-4">
          <h2 className="text-xl font-display font-semibold text-ink-900">{t('filters')}</h2>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-ink-600 hover:text-accent-600">
              <X className="mr-1.5 h-3.5 w-3.5" />
              {t('clear')}
            </Button>
          )}
        </div>

        <Separator variant="visible" />

        <FilterSection title={t('brand')}>
          <Select value={selectedBrand} onValueChange={(v) => setMultiple({ brand: v, model: undefined })} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('allBrands')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allBrands')}</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t('model')}>
          <Select value={selectedModel} onValueChange={(v) => setParam('model', v)} disabled={!selectedBrand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedBrand ? t('allModels') : t('selectBrandFirst')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allModels')}</SelectItem>
              {filteredModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <Separator variant="visible" />

        <FilterSection title={t('bodyType')}>
          <Select value={selectedBodyType} onValueChange={(v) => setParam('body_type', v)} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('allTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allTypes')}</SelectItem>
              {BODY_TYPES.map((b) => (
                <SelectItem key={b.value} value={b.value}>{t(`bodyTypes.${b.key}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t('fuel')}>
          <Select value={selectedFuel} onValueChange={(v) => setParam('fuel_type', v)} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('allFuels')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allFuels')}</SelectItem>
              {FUEL_TYPES.map((f) => (
                <SelectItem key={f.value} value={f.value}>{t(`fuels.${f.key}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t('gearbox')}>
          <Select value={selectedGearbox} onValueChange={(v) => setParam('gearbox', v)} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('allGearboxes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allGearboxes')}</SelectItem>
              {GEARBOX_TYPES.map((g) => (
                <SelectItem key={g.value} value={g.value}>{t(`gearboxes.${g.key}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <Separator variant="visible" />

        <FilterSection title={t('price')}>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder={t('min')}
              value={minPrice}
              onChange={(e) => setParam('min_price', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="1000"
            />
            <span className="text-ink-400 font-mono">–</span>
            <Input
              type="number"
              placeholder={t('max')}
              value={maxPrice}
              onChange={(e) => setParam('max_price', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="1000"
            />
          </div>
        </FilterSection>

        <FilterSection title={t('year')}>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder={t('min')}
              value={minYear}
              onChange={(e) => setParam('min_year', e.target.value || undefined)}
              className="w-full"
              min="1990"
              max={new Date().getFullYear()}
            />
            <span className="text-ink-400 font-mono">–</span>
            <Input
              type="number"
              placeholder={t('max')}
              value={maxYear}
              onChange={(e) => setParam('max_year', e.target.value || undefined)}
              className="w-full"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>
        </FilterSection>

        <FilterSection title={t('mileage')}>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder={t('min')}
              value={minMileage}
              onChange={(e) => setParam('min_mileage', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="5000"
            />
            <span className="text-ink-400 font-mono">–</span>
            <Input
              type="number"
              placeholder={t('max')}
              value={maxMileage}
              onChange={(e) => setParam('max_mileage', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="5000"
            />
          </div>
        </FilterSection>

        <Separator variant="visible" />

        <FilterSection title={t('options')}>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isNew}
                onCheckedChange={(checked) => setParam('is_new', checked ? 'true' : undefined)}
              />
              <span className="text-sm text-ink-700">{t('newOnly')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isFeatured}
                onCheckedChange={(checked) => setParam('is_featured', checked ? 'true' : undefined)}
              />
              <span className="text-sm text-ink-700">{t('featuredOnly')}</span>
            </label>
          </div>
        </FilterSection>

        <Button
          variant={hasFilters ? 'secondary' : 'ghost'}
          className="w-full"
          onClick={clearAll}
          disabled={!hasFilters}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {hasFilters ? t('reset') : t('noFilters')}
        </Button>
      </div>
    </aside>
  );
}
