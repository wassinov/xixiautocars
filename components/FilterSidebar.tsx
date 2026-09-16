'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'E85'] as const;
const GEARBOX_TYPES = ['Manuelle', 'Automatique', 'Séquentielle'] as const;
const BODY_TYPES = ['Berline', 'SUV', 'Break', 'Citadine', 'Coupé', 'Cabriolet', 'Utilitaire', 'Monospace'] as const;

export function FilterSidebar() {
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

  const brands = [
    { id: '1', name: 'Toyota' },
    { id: '2', name: 'Peugeot' },
    { id: '3', name: 'Renault' },
    { id: '4', name: 'Volkswagen' },
    { id: '5', name: 'BMW' },
    { id: '6', name: 'Mercedes' },
    { id: '7', name: 'Audi' },
    { id: '8', name: 'Citroën' },
  ];

  const models = [
    { id: '1', name: 'Yaris', brand_id: '1' },
    { id: '2', name: 'Corolla', brand_id: '1' },
    { id: '3', name: 'RAV4', brand_id: '1' },
    { id: '4', name: '208', brand_id: '2' },
    { id: '5', name: '3008', brand_id: '2' },
    { id: '6', name: 'Clio', brand_id: '3' },
    { id: '7', name: 'Captur', brand_id: '3' },
    { id: '8', name: 'Golf', brand_id: '4' },
    { id: '9', name: 'Tiguan', brand_id: '4' },
    { id: '10', name: 'Série 1', brand_id: '5' },
    { id: '11', name: 'X1', brand_id: '5' },
    { id: '12', name: 'Classe A', brand_id: '6' },
    { id: '13', name: 'GLA', brand_id: '6' },
    { id: '14', name: 'A3', brand_id: '7' },
    { id: '15', name: 'Q3', brand_id: '7' },
    { id: '16', name: 'C3', brand_id: '8' },
    { id: '17', name: 'C5 Aircross', brand_id: '8' },
  ];

  const filteredModels = selectedBrand ? models.filter((m) => m.brand_id === selectedBrand) : models;

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-6 p-4 bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-neutral-600 hover:text-primary-600">
              <X className="mr-1 h-3.5 w-3.5" />
              Effacer
            </Button>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Marque</label>
          <Select value={selectedBrand} onValueChange={(v) => setMultiple({ brand: v, model: undefined })} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les marques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les marques</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Modèle</label>
          <Select value={selectedModel} onValueChange={(v) => setParam('model', v)} disabled={!selectedBrand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedBrand ? 'Tous les modèles' : 'Sélectionnez une marque' } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les modèles</SelectItem>
              {filteredModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Type de carrosserie</label>
          <Select value={selectedBodyType} onValueChange={(v) => setParam('body_type', v)} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous types</SelectItem>
              {BODY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Carburant</label>
          <Select value={selectedFuel} onValueChange={(v) => setParam('fuel_type', v)} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous carburants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous carburants</SelectItem>
              {FUEL_TYPES.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Boîte de vitesses</label>
          <Select value={selectedGearbox} onValueChange={(v) => setParam('gearbox', v)} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes</SelectItem>
              {GEARBOX_TYPES.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Prix (€)</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setParam('min_price', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="1000"
            />
            <span className="text-neutral-400">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setParam('max_price', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Année</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minYear}
              onChange={(e) => setParam('min_year', e.target.value || undefined)}
              className="w-full"
              min="1990"
              max={new Date().getFullYear()}
            />
            <span className="text-neutral-400">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxYear}
              onChange={(e) => setParam('max_year', e.target.value || undefined)}
              className="w-full"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Kilométrage</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minMileage}
              onChange={(e) => setParam('min_mileage', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="5000"
            />
            <span className="text-neutral-400">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxMileage}
              onChange={(e) => setParam('max_mileage', e.target.value || undefined)}
              className="w-full"
              min="0"
              step="5000"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={isNew}
              onCheckedChange={(checked) => setParam('is_new', checked ? 'true' : undefined)}
            />
            <span className="text-sm text-neutral-700">Véhicules neufs uniquement</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={isFeatured}
              onCheckedChange={(checked) => setParam('is_featured', checked ? 'true' : undefined)}
            />
            <span className="text-sm text-neutral-700">Vedettes uniquement</span>
          </label>
        </div>

        <Button className="w-full" onClick={clearAll} disabled={!hasFilters} variant={hasFilters ? 'default' : 'outline'}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {hasFilters ? 'Réinitialiser les filtres' : 'Aucun filtre actif'}
        </Button>
      </div>
    </aside>
  );
}