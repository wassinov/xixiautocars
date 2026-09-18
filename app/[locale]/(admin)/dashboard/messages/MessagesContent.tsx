'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, ChevronLeft, ChevronRight, Eye, Reply, Archive, Trash2, MoreHorizontal, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/use-toast';

const ITEMS_PER_PAGE = 20;

interface MessageData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  car: {
    id: string;
    models: {
      name: string;
      brands: { name: string } | null;
    } | null;
  } | null;
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const variants = { new: 'destructive', read: 'default', replied: 'success' } as const;
  // CORRECTION : utiliser les clés plates qui existent dans le JSON (statusNew, statusRead, statusReplied)
  const labels = { new: t('statusNew'), read: t('statusRead'), replied: t('statusReplied') };
  return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{labels[status as keyof typeof labels] || status}</Badge>;
}

export default function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin.messages');
  const tCommon = useTranslations('common');

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // CORRECTION : structure cars → models → brands (pas de FK directe cars → brands)
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

      const search = searchParams.get('search');
      const status = searchParams.get('status');

      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      if (status) query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) throw error;

      // CORRECTION : car est un objet (relation plusieurs-vers-un), pas un tableau
      // Pas de transformation nécessaire, on utilise directement les données
      setMessages(data as MessageData[]);
      setTotal(count || 0);
      setPage(currentPage);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Erreur fetchMessages:', err);
      toast({ title: tCommon('error'), description: 'Impossible de charger les messages', variant: 'destructive' });
    } finally {
      // CRITIQUE : setIsLoading(false) dans finally
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

  // Utiliser searchParams.toString() comme dépendance stable pour éviter la boucle infinie
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    fetchMessages();
  }, [searchParamsString]);

  const createPageUrl = (newPage: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (newPage > 1) sp.set('page', String(newPage));
    else sp.delete('page');
    return `/${locale}/dashboard/messages?${sp.toString()}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (e.target.value) sp.set('search', e.target.value);
    else sp.delete('search');
    sp.delete('page');
    router.push(`/${locale}/dashboard/messages?${sp.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set('status', value);
    else sp.delete('status');
    sp.delete('page');
    router.push(`/${locale}/dashboard/messages?${sp.toString()}`);
  };

  const hasFilters = Array.from(searchParams.entries()).some(([k]) => k !== 'page');

  // CORRECTION : vraie suppression .delete() au lieu de updateMessageStatus(id, 'deleted')
  // 'deleted' n'existe pas dans le CHECK constraint (new, read, replied, closed)
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
        {/* CORRECTION : border-primary au lieu de border-primary-600 */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-1 text-neutral-600">{tCommon('total')} {total} {tCommon('messages')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder={t('search')}
            value={searchParams.get('search') || ''}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        <Select
          value={searchParams.get('status') || ''}
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
          <a href={`/${locale}/dashboard/messages`} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 self-end">
            <Filter className="h-4 w-4" />
            {t('clearFilters')}
          </a>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>{t('table.client')}</TableHead>
              <TableHead>{t('table.contact')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('table.vehicle')}</TableHead>
              <TableHead>{t('table.message')}</TableHead>
              <TableHead className="w-36">{t('table.status')}</TableHead>
              <TableHead className="w-40">{t('table.date')}</TableHead>
              <TableHead className="w-56 text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-neutral-500">{tCommon('noData')}</TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="font-mono text-sm text-neutral-500">#{msg.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <p className="font-medium text-neutral-900">{msg.full_name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-neutral-600">{msg.email}</p>
                    {msg.phone && <p className="text-xs text-neutral-400">{msg.phone}</p>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {msg.car ? (
                      <p className="text-sm text-neutral-600">{msg.car.models?.brands?.name} {msg.car.models?.name}</p>
                    ) : (
                      <span className="text-sm text-neutral-400">{t('noVehicle')}</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-neutral-600 line-clamp-2">{msg.message}</p>
                  </TableCell>
                  <TableCell><StatusBadge status={msg.status} t={t} /></TableCell>
                  <TableCell className="text-sm text-neutral-500">{format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateMessageStatus(msg.id, 'read')}>
                          <Eye className="mr-2 h-4 w-4" />{t('actions.markRead')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateMessageStatus(msg.id, 'replied')}>
                          <Reply className="mr-2 h-4 w-4" />{t('actions.markReplied')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(msg.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />{t('actions.delete')}
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
            <a href={createPageUrl(page - 1)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50">
              <ChevronLeft className="h-4 w-4 inline-block mr-1" />{t('pagination.prev')}
            </a>
          )}
          <span className="px-4 py-2 text-sm font-medium text-neutral-600">{t('pagination.page', { current: page, total: totalPages })}</span>
          {page < totalPages && (
            <a href={createPageUrl(page + 1)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50">
              {t('pagination.next')}<ChevronRight className="h-4 w-4 inline-block ml-1" />
            </a>
          )}
        </nav>
      )}
    </div>
  );
}