'use client';

import { SITE_URL } from '@/lib/seo';

interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  url: string;
  logo: string;
  image: string;
  openingHours: string[];
  priceRange: string;
  currenciesAccepted: string;
  paymentAccepted: string;
  areaServed: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}

export function LocalBusinessSchema({
  name,
  description,
  address,
  telephone,
  email,
  url,
  logo,
  image,
  openingHours,
  priceRange,
  currenciesAccepted,
  paymentAccepted,
  areaServed,
  geo,
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name,
    description,
    url,
    logo,
    image,
    telephone,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
    geo: geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: geo.latitude,
          longitude: geo.longitude,
        }
      : undefined,
    openingHoursSpecification: openingHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1]?.split('-')[0] || '09:00',
      closes: hours.split(' ')[1]?.split('-')[1] || '19:00',
    })),
    priceRange,
    currenciesAccepted,
    paymentAccepted,
    areaServed: areaServed.map((area) => ({
      '@type': 'AdministrativeArea',
      name: area,
    })),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${address.streetAddress}, ${address.postalCode} ${address.addressLocality}, ${address.addressCountry}`
    )}`,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}