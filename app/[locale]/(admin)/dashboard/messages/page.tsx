import MessagesContent from './MessagesContent';

export const dynamic = 'force-dynamic';

export default async function MessagesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) { // BUG-10 : params = Promise en Next 16
  const resolvedSearchParams = await searchParams;
  const { locale } = await params;

  const normalizedSearchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      normalizedSearchParams[key] = value[0];
    } else if (value !== undefined) {
      normalizedSearchParams[key] = value;
    }
  }

  return <MessagesContent searchParams={normalizedSearchParams} locale={locale} />;
}