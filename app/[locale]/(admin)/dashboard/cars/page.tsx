import CarsContent from './CarsContent';

export const dynamic = 'force-dynamic';

export default async function CarsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) { // BUG-10 : params retiré (inutilisé depuis l'Étape 22)
  const resolvedSearchParams = await searchParams;
  
  // Convert searchParams to the expected format
  const normalizedSearchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      normalizedSearchParams[key] = value[0];
    } else if (value !== undefined) {
      normalizedSearchParams[key] = value;
    }
  }

  return <CarsContent searchParams={normalizedSearchParams} />; // BUG-11 : prop locale retirée (CarsContent prend sa locale via useLocale)
}