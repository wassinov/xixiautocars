'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, ChevronLeft, ChevronRight, Eye, Reply, Trash2, MoreHorizontal, Filter } from 'lucide-react';
import { Link, useRouter } from '@/i18n'; // BUG-20 : liens + navigation auto-préfixés
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/use-toast';
import { cn, safeIlikePattern, dateFnsLocale } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

interface MessageData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  car: { // BUG-07 : contact_messages.car_id → cars = to-one → OBJET (null si pas de véhicule)
    id: string;
    models: { // to-one → OBJET
      name: string;
      brands: { name: string }; // to-one → OBJET
    } | null;
  } | null;
}

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
}

interface MessagesContentProps {
  searchParams: SearchParams;
  locale: string;
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const variants = { new: 'highlight' as const, read: 'default' as const, replied: 'sage' as const };
  const labels = { new: t('statusNew'), read: t('statusRead'), replied: t('statusReplied') };
  return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{labels[status as keyof typeof labels] || status}</Badge>;
}

export default function MessagesContent({ searchParams, locale }: MessagesContentProps) {
  const router = useRouter();
  const t = useTranslations('admin.messages');
  const tCommon = useTranslations('common');

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  // BUG-15 : champ de recherche local — la navigation est débounce, plus de push à chaque frappe
  const [searchInput, setSearchInput] = useState(searchParams.search || '');

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('contact_messages')
        .select(`
          id, full_name, email, phone, message, status, created_at,
          car:cars(
            id,
            models(
              id,
              name,
              brands(id, name)
            )
          )
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      const search = searchParams.search;
      const status = searchParams.status;

      if (search) query = query.or(`full_name.ilike.${safeIlikePattern(search)},email.ilike.${safeIlikePattern(search)}`); // BUG-16 : motif cité
      if (status) query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) throw error;

      setMessages(data as unknown as MessageData[]); // BUG-07 : to-one = objet au runtime (l'inférence postgrest sans schéma devine « tableau »)
      setTotal(count || 0);
      setPage(currentPage);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Erreur fetchMessages:', err);
      toast({ title: tCommon('error'), description: tCommon('loadError'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (!error) {
      fetchMessages();
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [searchParams]);

  const createPageUrl = (newPage: number) => {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (k !== 'page' && v) sp.set(k, v); });
    if (newPage > 1) sp.set('page', String(newPage));
    return `/dashboard/messages?${sp.toString()}`;
  };

  // BUG-15 : la recherche vit dans un état local ; la navigation ne part qu'après 400 ms sans frappe
  useEffect(() => {
    if (searchInput === (searchParams.search || '')) return; // montage ou URL déjà à jour : rien à pousser

    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => { if (k !== 'page' && k !== 'search' && v) sp.set(k, v); });
      if (searchInput) sp.set('search', searchInput);
      router.push(`/dashboard/messages?${sp.toString()}`);
    }, 400);

    return () => clearTimeout(timer); // chaque frappe annule le timer précédent
  }, [searchInput, searchParams, locale, router]);

  // BUG-15 : resynchronise le champ si l'URL change (reset des filtres, lien direct…)
  useEffect(() => {
    setSearchInput(searchParams.search || '');
  }, [searchParams.search]);

  const handleStatusChange = (value: string) => {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (k !== 'page' && k !== 'search' && v) sp.set(k, v); });
    if (searchInput) sp.set('search', searchInput); // BUG-15 : préserve la recherche en cours de frappe
    if (value) sp.set('status', value);
    else sp.delete('status');
    sp.delete('page');
    router.push(`/dashboard/messages?${sp.toString()}`);
  };

  const hasFilters = Object.entries(searchParams).some(([k]) => k !== 'page');

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete'))) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: tCommon('error'), description: error.message, variant: 'destructive' });
      return;
    }

    fetchMessages();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">{t('title')}</h1>
          <p className="mt-1 text-base text-ink-600">{tCommon('total')} {total} {tCommon('messages')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            placeholder={t('search')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={searchParams.status || ''}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allStatus')}</SelectItem>
            <SelectItem value="new">{t('statusNew')}</SelectItem>
            <SelectItem value="read">{t('statusRead')}</SelectItem>
            <SelectItem value="replied">{t('statusReplied')}</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Link href="/dashboard/messages" className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:border-accent-300 hover:text-accent-700 self-end transition-colors">
            <Filter className="h-4 w-4" />
            {t('clearFilters')}
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-ink-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-ink-200 bg-ink-50">
              <TableHead className="w-10 text-left">#</TableHead>
              <TableHead className="text-left">{t('table.client')}</TableHead>
              <TableHead className="text-left">{t('table.contact')}</TableHead>
              <TableHead className="hidden md:table-cell text-left">{t('table.vehicle')}</TableHead>
              <TableHead className="text-left">{t('table.message')}</TableHead>
              <TableHead className="w-36 text-left">{t('table.status')}</TableHead>
              <TableHead className="w-40 text-left">{t('table.date')}</TableHead>
              <TableHead className="w-56 text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-ink-500">{tCommon('noData')}</TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.id} className="border-b border-ink-100 hover:bg-ink-50 transition-colors">
                  <TableCell className="p-4 font-mono text-sm text-ink-500">#{msg.id.slice(0, 8)}</TableCell>
                  <TableCell className="p-4">
                    <p className="font-medium text-ink-900">{msg.full_name}</p>
                  </TableCell>
                  <TableCell className="p-4">
                    <p className="text-sm text-ink-600">{msg.email}</p>
                    {msg.phone && <p className="text-sm text-ink-400">{msg.phone}</p>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-4">
                    {msg.car ? (
                      <p className="text-sm text-ink-600">{msg.car.models?.brands?.name} {msg.car.models?.name}</p>
                    ) : (
                      <span className="text-sm text-ink-400">{t('noVehicle')}</span>
                    )}
                  </TableCell>
                  <TableCell className="p-4 max-w-xs">
                    <p className="text-sm text-ink-600 line-clamp-2">{msg.message}</p>
                  </TableCell>
                  <TableCell className="p-4"><StatusBadge status={msg.status} t={t} /></TableCell>
                  <TableCell className="p-4 text-sm text-ink-500">{format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm', { locale: dateFnsLocale(locale) })}</TableCell>
                  <TableCell className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-9 w-9 rounded-lg p-1 hover:bg-ink-100 hover:border-accent-300 transition-colors" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4 text-ink-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-ink-200">
                        <DropdownMenuItem className="flex items-center gap-2  text-ink-700 hover:bg-accent-50 hover:text-accent-700 hover:border-accent-300" onClick={() => updateMessageStatus(msg.id, 'read')}>
                          <Eye className="h-4 w-4" />
                          {t('actions.markRead')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2  text-ink-700 hover:bg-accent-50 hover:text-accent-700 hover:border-accent-300" onClick={() => updateMessageStatus(msg.id, 'replied')}>
                          <Reply className="h-4 w-4" />
                          {t('actions.markReplied')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-ink-200" />
                        <DropdownMenuItem className="text-terracotta-600 focus:text-terracotta-600 hover:bg-terracotta-50 hover:border-accent-300" onClick={() => handleDelete(msg.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link href={createPageUrl(page - 1)} className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700',
              'bg-white border border-ink-300 rounded-lg',
              'hover:bg-ink-50 hover:border-accent-300 transition-colors duration-200'
            )}>
              <ChevronLeft className="h-4 w-4" /> {t('pagination.prev')}
            </Link>
          )}

          <span className="px-4 py-2.5 text-sm font-medium text-ink-600">{t('pagination.page', { current: page, total: totalPages })}</span>

          {page < totalPages && (
            <Link href={createPageUrl(page + 1)} className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700',
              'bg-white border border-ink-300 rounded-lg',
              'hover:bg-ink-50 hover:border-accent-300 transition-colors duration-200'
            )}>
              {t('pagination.next')} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}