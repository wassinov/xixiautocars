import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL, localePath, languagesAlternates } from '@/lib/seo';

// BUG-24 : /sitemap.xml — pages statiques × hreflang 4 locales + fiches véhicules publiées.
// NOTE : servi hors middleware (le matcher exclut les chemins avec un point).
const STATIC_PATHS = ['', '/catalogue', '/contact'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${localePath('fr', path)}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
    alternates: { languages: languagesAlternates(path) },
  }));

  // Fiches véhicules disponibles — best effort : si la DB échoue,
  // le sitemap reste valide avec les pages statiques.
  try {
    const supabase = await createClient();
    const { data: cars } = await supabase
      .from('cars')
      .select('id, created_at')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(500);

    for (const car of cars ?? []) {
      const path = `/catalogue/${car.id}`;
      entries.push({
        url: `${SITE_URL}${localePath('fr', path)}`,
        lastModified: new Date(car.created_at),
        changeFrequency: 'daily',
        priority: 0.6,
        alternates: { languages: languagesAlternates(path) },
      });
    }
  } catch {
    // sitemap dégradé : pages statiques uniquement
  }

  return entries;
}
