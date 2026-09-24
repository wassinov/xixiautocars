// BUG-24 : helpers SEO partagés (sitemap, robots, hreflang).
// L'URL canonique du site DOIT être définie en production via NEXT_PUBLIC_SITE_URL.
// Fallback dev : localhost (sera remplacé par NEXT_PUBLIC_SITE_URL en prod).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const LOCALES = ['fr', 'en', 'ar', 'zh'] as const;

// localePrefix: 'as-needed' → la locale par défaut (fr) n'est pas préfixée, les autres oui.
// '/' et '' sont normalisés ('/zh/' → '/zh') : une seule forme d'URL par page, cohérente avec next-intl.
export function localePath(locale: string, path: string): string {
  const p = path === '/' ? '' : path;
  if (locale === 'fr') return p || '/';
  return `/${locale}${p}`;
}

/** Map hreflang → URL absolue pour un chemin donné (fr = x-default). */
export function languagesAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${SITE_URL}${localePath(locale, path)}`;
  }
  languages['x-default'] = `${SITE_URL}${localePath('fr', path)}`;
  return languages;
}
