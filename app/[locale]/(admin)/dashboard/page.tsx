import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Car, Mail, Users, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Dashboard - Xixi Autocars Admin', description: 'Vue d\'ensemble de l\'activité du garage' };

export const dynamic = 'force-dynamic';

async function getKPIs() {
  const supabase = await createClient();

  const [
    { count: totalCars },
    { count: newCars },
    { count: unreadMessages },
    { count: featuredCars },
    { data: recentCars },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from('cars').select('*', { count: 'exact', head: true }).eq('is_available', true),
    supabase.from('cars').select('*', { count: 'exact', head: true }).eq('is_available', true).eq('is_new', true),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('cars').select('*', { count: 'exact', head: true }).eq('is_available', true).eq('is_featured', true),
    supabase.from('cars').select('id, models (brands (name), name), price, currency, is_new, is_featured, created_at').eq('is_available', true).order('created_at', { ascending: false }).limit(5),
    supabase.from('contact_messages').select('id, full_name, email, car_id, status, created_at, car:cars(models (brands (name), name))').order('created_at', { ascending: false }).limit(5),
  ]);

  return { totalCars: totalCars || 0, newCars: newCars || 0, unreadMessages: unreadMessages || 0, featuredCars: featuredCars || 0, recentCars: recentCars || [], recentMessages: recentMessages || [] };
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export default async function DashboardPage() {
  const t = await getTranslations('admin.dashboard');
  const tCommon = await getTranslations('common');
  const { totalCars, newCars, unreadMessages, featuredCars, recentCars, recentMessages } = await getKPIs();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-1 text-neutral-600">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Clock className="h-4 w-4" />
          <span>{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">{t('kpis.totalCars')}</CardTitle>
            <Car className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-neutral-900">{totalCars}</span>
              <span className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">{tCommon('available')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">{t('kpis.newCars')}</CardTitle>
            <Car className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-neutral-900">{newCars}</span>
              <span className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">{tCommon('of')} {totalCars} {tCommon('vehicles')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">{t('kpis.unreadMessages')}</CardTitle>
            <Mail className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-neutral-900">{unreadMessages}</span>
              <Badge variant={unreadMessages > 0 ? 'destructive' : 'success'} className="text-xs">
                {unreadMessages > 0 ? tCommon('toProcess') : tCommon('upToDate')}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-1">{tCommon('needResponse')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">{t('kpis.featuredCars')}</CardTitle>
            <Car className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-neutral-900">{featuredCars}</span>
              <span className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">{tCommon('featuredOnHome')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('recentCars')}
              <Link href={`/dashboard/cars`} className="text-sm font-normal text-primary-600 hover:text-primary-700">{tCommon('viewAll')}</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCars.length === 0 ? (
              <p className="text-center text-neutral-500 py-8">{tCommon('noData')}</p>
            ) : (
              <div className="space-y-4">
                {recentCars.map((car) => (
                  <div key={car.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{car.models?.[0]?.brands?.[0]?.name} {car.models?.[0]?.name}</p>
                        <p className="text-sm text-neutral-500">{formatPrice(car.price, car.currency)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {car.is_new && <Badge variant="success" className="text-xs">{t('status.new')}</Badge>}
                      {car.is_featured && <Badge variant="default" className="text-xs">{t('status.featured')}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('recentMessages')}
              <Link href={`/dashboard/messages`} className="text-sm font-normal text-primary-600 hover:text-primary-700">{tCommon('viewAll')}</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-center text-neutral-500 py-8">{tCommon('noData')}</p>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((msg) => {
                  const car = msg.car as { models?: { brands?: { name: string }; name: string } } | null;
                  return (
                    <div key={msg.id} className="flex items-start justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900 truncate">{msg.full_name}</p>
                          <Badge
                            variant={msg.status === 'new' ? 'destructive' : msg.status === 'read' ? 'default' : 'success'}
                            className="text-xs"
                          >
                            {msg.status === 'new' ? t('status.new') : msg.status === 'read' ? t('status.read') : t('status.replied')}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-500">{msg.email}</p>
                        {car?.models && (
                          <p className="text-xs text-neutral-400 mt-1">
                            {tCommon('about')} : {car.models.brands?.name} {car.models.name}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 whitespace-nowrap ml-4">
                        {format(new Date(msg.created_at), 'dd/MM HH:mm', { locale: fr })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('quickActions')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/dashboard/cars/new`} className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
              <Car className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-neutral-900">{t('actions.addCar.title')}</p>
              <p className="text-sm text-neutral-500">{t('actions.addCar.desc')}</p>
            </Link>
            <Link href={`/dashboard/cars`} className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
              <Car className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-neutral-900">{t('actions.manageCars.title')}</p>
              <p className="text-sm text-neutral-500">{t('actions.manageCars.desc')}</p>
            </Link>
            <Link href={`/dashboard/messages`} className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
              <Mail className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-neutral-900">{t('actions.messages.title')}</p>
              <p className="text-sm text-neutral-500">{t('actions.messages.desc', { count: unreadMessages })}</p>
            </Link>
            <Link href={`/dashboard/settings`} className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-neutral-900">{t('actions.settings.title')}</p>
              <p className="text-sm text-neutral-500">{t('actions.settings.desc')}</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
