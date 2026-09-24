'use client';

import Image from 'next/image';
import { Car, MapPin, Fuel, Settings, Calendar, ArrowRight } from 'lucide-react';
import { cn, formatPrice, formatMileage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n'; // BUG-20 : lien auto-préfixé par locale — BUG-32 : la carte devient un vrai <a>
import { useTranslations, useLocale } from 'next-intl';
import type { CarWithRelations } from '@/types/car';

interface CarCardProps {
  car: CarWithRelations;
  priority?: boolean;
  className?: string;
}

export function CarCard({ car, priority = false, className }: CarCardProps) {
  const t = useTranslations('car');
  const locale = useLocale(); // BUG-22 : formats prix/km localisés
  const model = car.models; // BUG-07 : to-one → PostgREST renvoie un OBJET, pas un tableau
  const brandName = model?.brands?.name || '';
  const modelName = model?.name || '';
  const primaryImage = car.car_images?.find((img) => img.is_primary) ?? car.car_images?.[0];

  return (
    <article
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl border border-ink-200 overflow-hidden',
        ' transition-all duration-300 ',
        'hover:-translate-y-1',
        'h-full',
        className
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {car.is_featured && (
          <Badge variant="accent" size="sm">
            {t('featured')}
          </Badge>
        )}
        {car.is_new && (
          <Badge variant="sage" size="sm">
            {t('new')}
          </Badge>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-vehicle bg-ink-100 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={`${brandName} ${modelName} ${car.year}`}
            fill
            className="object-cover transition-transform duration-500  group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e5e5' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-400">
            <Car className="h-12 w-12" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-ink-500 font-body uppercase tracking-wider">
              {brandName}
            </p>
            <h3 className="mt-1 text-xl font-display font-semibold text-ink-900 line-clamp-1">
              {modelName}
            </h3>
          </div>
          <span className="whitespace-nowrap text-xl font-display font-bold text-ink-900 shrink-0">
            {formatPrice(car.price, car.currency, locale)}
          </span>
        </div>

        {/* Specs */}
        <dl className="mt-4 flex flex-1 flex-wrap items-center gap-3 text-sm text-ink-600">
          <dt className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-ink-400" aria-hidden="true" />
            <span className="font-mono">{car.year}</span>
          </dt>
          {car.mileage !== null && (
            <dd className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-400" aria-hidden="true" />
              <span className="font-mono">{formatMileage(car.mileage, locale)}</span>
            </dd>
          )}
          {car.fuel_type && (
            <dd className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4 text-ink-400" aria-hidden="true" />
              <span className="font-mono text-xs">{car.fuel_type}</span>
            </dd>
          )}
          {car.gearbox && (
            <dd className="flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-ink-400" aria-hidden="true" />
              <span className="font-mono text-xs">{car.gearbox}</span>
            </dd>
          )}
        </dl>

        {/* CTA — visuel uniquement (BUG-32) : toute la carte est le lien, le bouton n'est plus focusable pour éviter un contrôle mort au clavier */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          className="mt-5 pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {t('viewDetails')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* BUG-32 : lien étiré par-dessus la carte — <a> réel dans le HTML (crawlable, clic-milieu/onglet), href préfixé par locale */}
      <Link
        href={`/catalogue/${car.id}`}
        aria-label={`${t('viewDetails')} — ${brandName} ${modelName}`}
        className="absolute inset-0 z-20"
      />
    </article>
  );
}