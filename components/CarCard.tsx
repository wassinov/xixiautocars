'use client';

import Image from 'next/image';
import { Car, MapPin, Fuel, Settings, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CarWithRelations } from '@/types/car';

interface CarCardProps {
  car: CarWithRelations;
  priority?: boolean;
}

export function CarCard({ car, priority = false }: CarCardProps) {
  const brandName = car.models?.brands?.name || '';
  const modelName = car.models?.name || '';
  const primaryImage = car.car_images?.find((img) => img.is_primary) ?? car.car_images?.[0];
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: car.currency,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <article className="group relative flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
      {car.is_featured && (
        <span className="absolute top-3 left-3 z-10 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-full">
          Vedette
        </span>
      )}
      {car.is_new && (
        <span className={cn('absolute top-3', car.is_featured ? 'left-3 mt-6' : 'left-3', 'z-10 px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-full')}>
          Neuf
        </span>
      )}

      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={`${brandName} ${modelName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e5e5' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <Car className="h-12 w-12" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-neutral-500">{brandName}</p>
            <h3 className="mt-0.5 text-lg font-semibold text-neutral-900 line-clamp-1">
              {modelName}
            </h3>
          </div>
          <span className="whitespace-nowrap text-xl font-bold text-primary-700">
            {formatPrice(car.price)}
          </span>
        </div>

        <dl className="mt-3 flex flex-1 flex-wrap items-center gap-3 text-sm text-neutral-600">
          <dt className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {car.year}
          </dt>
          {car.mileage !== null && (
            <dd className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {car.mileage.toLocaleString('fr-FR')} km
            </dd>
          )}
          {car.fuel_type && (
            <dd className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4" aria-hidden="true" />
              {car.fuel_type}
            </dd>
          )}
          {car.gearbox && (
            <dd className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" aria-hidden="true" />
              {car.gearbox}
            </dd>
          )}
        </dl>

        <a
          href={`/catalogue/${car.id}`}
          className="mt-4 block w-full rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Voir les détails
        </a>
      </div>
    </article>
  );
}
