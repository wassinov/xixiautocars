'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Menu, LayoutDashboard, LogOut, ChevronLeft, Mail, Users, Settings, Truck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from '@/components/LanguageSelector';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'cars', href: '/dashboard/cars', icon: Truck },
  { name: 'messages', href: '/dashboard/messages', icon: Mail },
  { name: 'settings', href: '/dashboard/settings', icon: Settings },
] as const;

export default function AdminSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
    router.push('/login');
  };

  return (
    <div className="bg-ink-50 flex flex-col h-full">
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 bg-white rtl:right-4 rtl:left-auto p-2 rounded-lg hover:bg-ink-100 hover:border-accent-300 transition-colors" aria-label="Ouvrir le menu">
            <Menu className="h-6 w-6 text-ink-700" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 rtl:left-auto rtl:right-0 bg-white border-r border-ink-200">
          <nav className="flex h-full flex-col">
            <div className="flex h-28 items-center px-6 border-b border-ink-200">
              <Link href="/dashboard" className="flex w-full items-center justify-center gap-2">
                <Image
                  src="/logo.jpg"
                  alt="Xixi Autocars"
                  width={160}
                  height={160}
                  className="h-20 w-auto"
                />
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-ink-600',
                      isActive
                        ? 'bg-accent-50 text-accent-700'
                        : 'hover:bg-ink-100 hover:text-ink-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(item.name)}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-ink-200 p-4">
              <LanguageSelector />
              <Separator variant="visible" className="my-4" />
              <Button variant="ghost" className="w-full justify-start gap-3 text-terracotta-600 hover:bg-terracotta-50" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                {t('logout')}
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col bg-white border-r border-ink-200 rtl:left-auto rtl:right-0">
        <div className="flex h-28 items-center px-6 border-b border-ink-200">
          <Link href="/dashboard" className="flex w-full items-center justify-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Xixi Autocars"
              width={200}
              height={200}
              className="h-24 w-auto"
            />
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-ink-600',
                  isActive
                    ? 'bg-accent-50 text-accent-700'
                    : 'hover:bg-ink-100 hover:text-ink-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.name)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-ink-200 p-4">
          <LanguageSelector />
          <Separator variant="visible" className="my-4" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full justify-start gap-3 rtl:ml-auto p-2 rounded-lg hover:bg-ink-100 hover:border-accent-300 transition-colors flex items-center" aria-label="Menu utilisateur">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-sm font-display text-accent-600 bg-accent-100">A</AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 truncate rtl:text-right">
                  <p className="font-medium text-ink-900">Admin</p>
                  <p className="text-sm text-ink-500">Administrateur</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-ink-400 rtl:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-ink-200">
              <DropdownMenuItem className="text-terracotta-600 focus:text-terracotta-600" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </div>
  );
}