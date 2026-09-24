'use client';

// BUG-21 : menu mobile du site public — le burger du header n'avait aucun handler.
import { useState } from 'react';
import { Link } from '@/i18n'; // BUG-20 : liens auto-préfixés selon la locale (as-needed)
import { useTranslations } from 'next-intl';
import { Menu, Truck, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');

  const links = [
    { href: '/', label: t('home') },
    { href: '/catalogue', label: t('catalog') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 text-ink-600 hover:text-ink-900" aria-label="Menu" aria-expanded={open}>
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="border-b border-ink-200 p-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Truck className="h-6 w-6 text-accent-600" />
            Xixi Autocars
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-2" aria-label="Navigation mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-accent-600"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 text-ink-400" />
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
