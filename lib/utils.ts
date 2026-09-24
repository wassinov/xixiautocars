import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function magazineContainer(extra?: string) {
  return cn('container-custom', extra);
}

export function magazineGrid(extra?: string) {
  return cn('magazine-grid', extra);
}

export function asymmetricCols(start: number, end: number) {
  return cn(`lg:col-span-${start} lg:col-start-${end}`);
}

export function revealDelay(index: number, base = 100) {
  const delays = [0, 100, 200, 300, 400, 500];
  return cn(`animate-reveal delay-${delays[index % delays.length]}`);
}

export function formatPrice(price: number, currency: string = 'EUR', locale: string = 'fr-FR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(km: number | null, locale: string = 'fr-FR') {
  if (km === null || km === undefined) return '—';
  return `${km.toLocaleString(locale)} km`;
}

export function formatYear(year: number) {
  return String(year);
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Échappe un terme de recherche pour les filtres PostgREST `or(...)` (BUG-16).
 * - Les guillemets et antislashs sont retirés (impossible de fermer une valeur citée) ;
 * - Le motif `%terme%` est ensuite cité : les séparateurs de la grammaire
 *   PostgREST (, ( ) .) redeviennent littéraux → impossible d'injecter
 *   des conditions supplémentaires via le champ de recherche.
 * Échoue sûr : si le serveur refusait la valeur citée, requête 400 → toast d'erreur.
 */
export function safeIlikePattern(term: string): string {
  const safe = term.replace(/[\\"]/g, '');
  return `"%${safe}%"`;
}

// BUG-22 : locale date-fns correspondant à la locale next-intl active ('fr' par défaut).
import type { Locale } from 'date-fns';
import { fr as dateFnsFr, enUS as dateFnsEn, ar as dateFnsAr, zhCN as dateFnsZh } from 'date-fns/locale';

export function dateFnsLocale(locale: string): Locale {
  switch (locale) {
    case 'en': return dateFnsEn;
    case 'ar': return dateFnsAr;
    case 'zh': return dateFnsZh;
    default: return dateFnsFr;
  }
}