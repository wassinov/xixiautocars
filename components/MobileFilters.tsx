'use client';

// BUG-21 : filtres du catalogue accessibles sur mobile (la sidebar était hidden lg:block).
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from '@/components/FilterSidebar';

interface MobileFiltersProps {
  brands: { id: string; name: string }[];
  models: { id: string; name: string; brand_id: string }[];
}

export function MobileFilters({ brands, models }: MobileFiltersProps) {
  const t = useTranslations('catalog'); // BUG-23 (Étape 30) : filtres traduits
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-center gap-2" aria-expanded={open}>
            <SlidersHorizontal className="h-4 w-4" />
            {t('filters')}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 max-w-[85vw] overflow-y-auto p-0 sm:w-96">
          <SheetHeader className="border-b border-ink-200 p-4 text-left">
            <SheetTitle className="text-lg font-semibold text-ink-900">{t('filters')}</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <FilterSidebar brands={brands} models={models} className="w-full" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
