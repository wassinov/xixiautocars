import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Car, Mail, Users, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Shield, CheckCircle, CreditCard as CreditCardIcon, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n'; // BUG-20 : liens auto-préfixés selon la locale (as-needed)
import { cn } from '@/lib/utils';
import { formatPrice, dateFnsLocale } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard - Xixi Autocars Admin', description: "Vue d'ensemble de l'activité du garage" };

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

const KPI_CARDS = [
  { key: 'totalCars', label: 'Véhicules totaux', icon: Car, color: 'ink', trend: null },
  { key: 'newCars', label: 'Véhicules neufs', icon: Car, color: 'sage', trend: 'vehiclesAvailable' },
  { key: 'unreadMessages', label: 'Messages non lus', icon: Mail, color: 'accent', trend: 'needResponse' },
  { key: 'featuredCars', label: 'Védettes', icon: Star, color: 'accent', trend: 'featuredOnHome' },
] as const;

export default async function DashboardPage() { // BUG-10 : params retiré (inutilisé depuis l'Étape 17)
  const t = await getTranslations('admin.dashboard');
  const tCommon = await getTranslations('common');
  const locale = await getLocale(); // BUG-22 : formats localisés (sans toucher aux params — BUG-10)
  const { totalCars, newCars, unreadMessages, featuredCars, recentCars, recentMessages } = await getKPIs();

  const kpiValues = { totalCars, newCars, unreadMessages, featuredCars };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">{t('title')}</h1>
          <p className="mt-1 text-base text-ink-600">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Clock className="h-4 w-4" />
          <span>{format(new Date(), 'EEEE d MMMM yyyy', { locale: dateFnsLocale(locale) })}</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi, i) => {
          const value = kpiValues[kpi.key as keyof typeof kpiValues];
          const Icon = kpi.icon;
          const colorClasses = {
            ink: 'bg-ink-100 text-ink-600',
            sage: 'bg-sage-100 text-sage-600',
            accent: 'bg-accent-100 text-accent-600',
            terracotta: 'bg-terracotta-100 text-terracotta-600',
          };
          return (
            <Card key={kpi.key} className="hover:border-accent-300 transition-all duration-300 ">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-ink-600">{t(`kpis.${kpi.key}`)}</CardTitle>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[kpi.color as keyof typeof colorClasses])}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-display font-bold text-ink-900">{value}</span>
                  {kpi.key === 'unreadMessages' && (
                    <Badge variant={value > 0 ? 'highlight' : 'sage'} className="text-xs">
                      {value > 0 ? tCommon('toProcess') : tCommon('upToDate')}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {kpi.trend ? tCommon(kpi.trend, { total: totalCars }) : tCommon('available')}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:border-accent-300 transition-all duration-300 ">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="font-display font-semibold text-ink-900">{t('recentCars')}</span>
              <Link href="/dashboard/cars" className="text-sm font-medium text-accent-600 hover:border-accent-300 hover:text-accent-700 transition-colors">{tCommon('viewAll')}</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCars.length === 0 ? (
              <p className="text-center text-ink-500 py-8">{tCommon('noData')}</p>
            ) : (
              <div className="space-y-3">
                {recentCars.map((car) => (
                  <div key={car.id} className="flex items-center justify-between p-3 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-accent-600" />
                      </div>
                      <div>
                        <p className="font-medium text-ink-900">{(car.models as any)?.brands?.name} {(car.models as any)?.name}</p>
                        <p className="text-terracotta-600 font-mono">{formatPrice(car.price, car.currency, locale)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {car.is_new && <Badge variant="sage" className="text-xs">{t('status.new')}</Badge>}
                      {car.is_featured && <Badge variant="accent" className="text-xs">{t('status.featured')}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:border-accent-300 transition-all duration-300 ">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="font-display font-semibold text-ink-900">{t('recentMessages')}</span>
              <Link href="/dashboard/messages" className="text-sm font-medium text-accent-600 hover:border-accent-300 hover:text-accent-700 transition-colors">{tCommon('viewAll')}</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-center text-ink-500 py-8">{tCommon('noData')}</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => {
                  const car = msg.car as { models?: { brands?: { name: string }; name: string } } | null;
                  const statusVariants = { new: 'highlight' as const, read: 'default' as const, replied: 'sage' as const };
                  return (
                    <div key={msg.id} className="flex items-start justify-between p-3 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-ink-900 truncate">{msg.full_name}</p>
                          <Badge variant={statusVariants[msg.status as keyof typeof statusVariants] || 'default'} className="text-xs">
                            {msg.status === 'new' ? t('status.new') : msg.status === 'read' ? t('status.read') : t('status.replied')}
                          </Badge>
                        </div>
                        <p className="text-sm text-ink-500">{msg.email}</p>
                        {car?.models && (
                          <p className="text-sm text-ink-400 mt-1">
                            {tCommon('about')} : {car.models.brands?.name} {car.models.name}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-ink-400 whitespace-nowrap ms-4">
                        {format(new Date(msg.created_at), 'dd/MM HH:mm', { locale: dateFnsLocale(locale) })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover:border-accent-300 transition-all duration-300 ">
        <CardHeader>
          <CardTitle className="font-display font-semibold text-ink-900">{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/cars/new" className={cn(
              'p-5 border border-ink-200 rounded-2xl text-center',
              'hover:border-accent-300 hover:bg-accent-50 transition-all duration-200'
            )}>
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600">
                <Car className="h-7 w-7" />
              </div>
              <p className="font-medium text-ink-900">{t('actions.addCar.title')}</p>
              <p className="text-sm text-ink-500">{t('actions.addCar.desc')}</p>
            </Link>
            <Link href="/dashboard/cars" className={cn(
              'p-5 border border-ink-200 rounded-2xl text-center',
              'hover:border-accent-300 hover:bg-accent-50 transition-all duration-200'
            )}>
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <Car className="h-7 w-7" />
              </div>
              <p className="font-medium text-ink-900">{t('actions.manageCars.title')}</p>
              <p className="text-sm text-ink-500">{t('actions.manageCars.desc')}</p>
            </Link>
            <Link href="/dashboard/messages" className={cn(
              'p-5 border border-ink-200 rounded-2xl text-center',
              'hover:border-accent-300 hover:bg-accent-50 transition-all duration-200'
            )}>
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-terracotta-100 flex items-center justify-center text-terracotta-600">
                <Mail className="h-7 w-7" />
              </div>
              <p className="font-medium text-ink-900">{t('actions.messages.title')}</p>
              <p className="text-sm text-ink-500">{t('actions.messages.desc', { count: unreadMessages })}</p>
            </Link>
            <Link href="/dashboard/settings" className={cn(
              'p-5 border border-ink-200 rounded-2xl text-center',
              'hover:border-accent-300 hover:bg-accent-50 transition-all duration-200'
            )}>
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-ink-100 flex items-center justify-center text-ink-600">
                <Users className="h-7 w-7" />
              </div>
              <p className="font-medium text-ink-900">{t('actions.settings.title')}</p>
              <p className="text-sm text-ink-500">{t('actions.settings.desc')}</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}