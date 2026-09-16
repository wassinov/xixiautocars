'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { locales, localeNames, localeFlags, defaultLocale, type Locale } from '@/i18n';

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('common');

  const changeLocale = (newLocale: Locale) => {
    // Replace locale in pathname
    const segments = pathname.split('/').filter(Boolean);
    const currentLocaleIndex = locales.findIndex(l => segments[0] === l);
    
    let newPathname: string;
    if (currentLocaleIndex >= 0) {
      segments[0] = newLocale;
      newPathname = '/' + segments.join('/');
    } else {
      newPathname = `/${newLocale}${pathname}`;
    }
    
    // Preserve search params
    const search = searchParams.toString();
    const url = search ? `${newPathname}?${search}` : newPathname;
    
    router.push(url);
    router.refresh();
  };

  const currentLocaleName = localeNames[locale];
  const currentFlag = localeFlags[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 h-9 px-3">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentFlag} {currentLocaleName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => changeLocale(loc)}
            className={cn('flex items-center gap-2', loc === locale && 'bg-primary-50 text-primary-700')}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
            {loc === locale && <Check className="h-4 w-4 text-primary-600 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}