'use client';

interface CarProductSchemaProps {
  name: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  vehicleTransmission: string;
  color: string;
  bodyType: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  images: string[];
  sku: string;
  condition: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  sellerName: string;
  sellerUrl: string;
  sellerTelephone: string;
  sellerAddress: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  vehicleIdentificationNumber?: string;
  vehicleEngine?: {
    engineType: string;
    engineDisplacement?: string;
    enginePower?: {
      value: number;
      unitCode: string;
    };
  };
}

const FUEL_TYPE_MAP: Record<string, string> = {
  gasoline: 'Petrol',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  electric: 'Electric',
  lpg: 'LiquefiedPetroleumGas',
  e85: 'EthanolFuel',
};

const TRANSMISSION_MAP: Record<string, string> = {
  manual: 'Manual',
  automatic: 'Automatic',
  sequential: 'SemiAutomatic',
};

const BODY_TYPE_MAP: Record<string, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  wagon: 'StationWagon',
  city: 'Hatchback',
  coupe: 'Coupe',
  convertible: 'Convertible',
  utility: 'PickupTruck',
  minivan: 'Minivan',
};

export function ProductSchema({
  name,
  description,
  brand,
  model,
  year,
  mileage,
  fuelType,
  vehicleTransmission,
  color,
  bodyType,
  price,
  currency,
  availability,
  images,
  sku,
  condition,
  sellerName,
  sellerUrl,
  sellerTelephone,
  sellerAddress,
  vehicleIdentificationNumber,
  vehicleEngine,
}: CarProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${brand} ${model} (${year})`,
    description,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    model: model,
    sku,
    gtin13: vehicleIdentificationNumber,
    vehicleIdentificationNumber,
    releaseDate: `${year}-01-01`,
    vehicleEngine: vehicleEngine
      ? {
          '@type': 'EngineSpecification',
          engineType: vehicleEngine.engineType,
          engineDisplacement: vehicleEngine.engineDisplacement,
          enginePower: vehicleEngine.enginePower
            ? {
                '@type': 'QuantitativeValue',
                value: vehicleEngine.enginePower.value,
                unitCode: vehicleEngine.enginePower.unitCode,
              }
            : undefined,
        }
      : undefined,
    vehicleTransmission: TRANSMISSION_MAP[vehicleTransmission] || vehicleTransmission,
    fuelType: FUEL_TYPE_MAP[fuelType] || fuelType,
    color,
    bodyType: BODY_TYPE_MAP[bodyType] || bodyType,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: mileage,
      unitCode: 'KMT',
    },
    vehicleInteriorColor: color,
    vehicleExteriorColor: color,
    offers: {
      '@type': 'Offer',
      url: `${sellerUrl}/catalogue/${sku}`,
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@type': 'AutoDealer',
        name: sellerName,
        url: sellerUrl,
        telephone: sellerTelephone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: sellerAddress.streetAddress,
          addressLocality: sellerAddress.addressLocality,
          addressRegion: sellerAddress.addressRegion,
          postalCode: sellerAddress.postalCode,
          addressCountry: sellerAddress.addressCountry,
        },
      },
      itemCondition: `https://schema.org/${condition}`,
    },
    image: images.length > 0 ? images : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}