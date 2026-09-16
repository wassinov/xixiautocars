'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Truck, Menu, X, LayoutDashboard, LogOut, ChevronLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from '@/components/LanguageSelector';

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'cars', href: '/dashboard/cars', icon: Truck },
  { name: 'messages', href: '/dashboard/messages', icon: Menu },
  { name: 'settings', href: '/dashboard/settings', icon: LayoutDashboard },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = () => {
    window.location.href = `/${locale}/login`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md rtl:right-4 rtl:left-auto">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 rtl:left-auto rtl:right-0">
          <nav className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6 border-b">
              <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
                <Truck className="h-8 w-8 text-primary-600" />
                <span className="font-bold text-lg">Admin</span>
              </Link>
            </div>
            <div className="flex-1 space-y-1 p-4 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === `/${locale}${item.href}` || pathname.startsWith(`/${locale}${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(item.name)}
                  </Link>
                );
              })}
            </div>
            <div className="border-t p-4">
              <LanguageSelector />
              <Separator className="my-4" />
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                {t('logout')}
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-white border-r rtl:left-auto rtl:right-0">
        <div className="flex h-16 items-center px-6 border-b">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-lg">Mon Garage Admin</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === `/${locale}${item.href}` || pathname.startsWith(`/${locale}${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.name)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <LanguageSelector />
          <Separator className="my-4" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 rtl:ml-auto">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 truncate rtl:text-right">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-neutral-500">Administrateur</p>
                </div>
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64 flex-1">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}