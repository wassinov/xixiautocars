import { createNavigation } from 'next-intl/navigation';
import { routing } from './i18n/routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export { routing, locales, defaultLocale, type Locale } from './i18n/routing';

export const localeNames: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

export const localeFlags: Record<string, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  ar: '🇸🇦',
};