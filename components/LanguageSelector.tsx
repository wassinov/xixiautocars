'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n'; // BUG-20 : pathname non préfixé + navigation gérée par next-intl
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n';

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('common');

  const changeLocale = (newLocale: Locale) => {
    // BUG-20 : délègue le préfixage à next-intl (as-needed : fr sans préfixe, autres préfixées).
    // pathname vient de @/i18n → chemin INTERNE non préfixé ; les query params sont préservés.
    const search = searchParams.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { locale: newLocale });
  };

  const currentLocaleName = localeNames[locale];
  const currentFlag = localeFlags[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="gap-2 h-10 px-3 text-ink-700 hover:bg-ink-100 rounded-lg transition-colors flex items-center" aria-label="Changer de langue">
          <Globe className="h-4 w-4 text-ink-500" />
          <span className="hidden sm:inline text-sm font-medium">{currentFlag} {currentLocaleName}</span>
          <ChevronDown className="h-4 w-4 text-ink-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1 bg-white border-ink-200">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => changeLocale(loc)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              loc === locale ? 'bg-accent-50 text-accent-700' : 'text-ink-700 hover:bg-ink-50'
            )}
          >
            <span className="text-base">{localeFlags[loc]}</span>
            <span className="flex-1">{localeNames[loc]}</span>
            {loc === locale && <Check className="h-4 w-4 text-accent-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}