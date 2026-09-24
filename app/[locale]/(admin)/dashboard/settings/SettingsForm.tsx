'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { GARAGE_INFO_ID } from '@/lib/constants'; // BUG-27 : singleton garage_infos

interface GarageFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  google_maps_url: string;
  opening_hours: string;
  about_text: string;
  logo_url: string;
}

export default function SettingsForm() {
  const t = useTranslations('admin.settings');
  const tCommon = useTranslations('common');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<GarageFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    google_maps_url: '',
    opening_hours: '',
    about_text: '',
    logo_url: '',
  });

  const loadGarage = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('garage_infos')
      .select('id, name, address, phone, email, google_maps_url, opening_hours, about_text, logo_url')
      .eq('id', GARAGE_INFO_ID) // BUG-27 : cible le singleton, pas « la première ligne »
      .maybeSingle();

    if (error) {
      console.error('Error loading garage:', error);
      toast({ title: tCommon('error'), description: tCommon('loadError'), variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    if (data) {
      setFormData(data);
    } else {
      // No garage found, keep empty form
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        google_maps_url: '',
        opening_hours: '',
        about_text: '',
        logo_url: '',
      });
    }
    setIsLoading(false);
  };

  const handleChange = (name: keyof GarageFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const supabase = createClient();
      // BUG-27 : upsert sur l'UUID fixe du singleton — l'ancien insert laissait Supabase
      // générer un UUID aléatoire, invisible pour les pages publiques qui ciblent GARAGE_INFO_ID.
      const { error: upsertError } = await supabase
        .from('garage_infos')
        .upsert({ ...formData, id: GARAGE_INFO_ID });
      if (upsertError) throw upsertError;
      toast({ title: tCommon('success'), description: tCommon('updated') });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({ title: tCommon('error'), description: err instanceof Error ? err.message : tCommon('saveError'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadGarage();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">{t('title')}</h1>
          <p className="text-base text-ink-600">{t('subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card className="hover:border-accent-300 transition-all duration-300 ">
          <CardHeader>
            <CardTitle className="font-display font-semibold text-ink-900">{t('info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-ink-700 font-body">{t('name')} <span className="text-terracotta-600">*</span></Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder={t('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-ink-700 font-body">{t('phone')} <span className="text-terracotta-600">*</span></Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder={t('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-ink-700 font-body">{t('email')} <span className="text-terracotta-600">*</span></Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder={t('email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_maps_url" className="text-sm text-ink-700 font-body">{t('mapsUrl')}</Label>
                <Input id="google_maps_url" value={formData.google_maps_url} onChange={(e) => handleChange('google_maps_url', e.target.value)} placeholder="https://maps.google.com/?q=..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm text-ink-700 font-body">{t('address')} <span className="text-terracotta-600">*</span></Label>
              <Textarea id="address" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} rows={2} placeholder={t('address')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opening_hours" className="text-sm text-ink-700 font-body">{t('hours')} <span className="text-terracotta-600">*</span></Label>
              <Textarea id="opening_hours" value={formData.opening_hours || ''} onChange={(e) => handleChange('opening_hours', e.target.value)} rows={4} placeholder={t('hoursHelp')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about_text" className="text-sm text-ink-700 font-body">{t('about')}</Label>
              <Textarea id="about_text" value={formData.about_text || ''} onChange={(e) => handleChange('about_text', e.target.value)} rows={4} placeholder={t('about')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url" className="text-sm text-ink-700 font-body">{t('logoUrl')}</Label>
              <Input id="logo_url" value={formData.logo_url || ''} onChange={(e) => handleChange('logo_url', e.target.value)} placeholder={t('logoHelp')} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-300 transition-all duration-300 ">
          <CardHeader>
            <CardTitle className="font-display font-semibold text-ink-900">{t('storage')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-ink-50 rounded-lg p-4 border border-ink-200">
              <p className="font-medium text-ink-900">{t('bucketInfo')}</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                  Les images sont uploadées dans car-images/{'{{car_id}}'}/
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                  URLs publiques générées automatiquement
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                  Politiques RLS : lecture publique, écriture authentifiée
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-300 transition-all duration-300 ">
          <CardHeader>
            <CardTitle className="font-display font-semibold text-ink-900">{t('rlsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=" text-ink-600 mb-4">{t('rlsDesc')}</p>
            <ul className="space-y-2 text-sm text-ink-600">
              <li className="font-mono bg-ink-100 px-2 py-1 rounded">auth.uid() is not null</li>
              <li className="font-mono bg-ink-100 px-2 py-1 rounded">auth.jwt() : email for restrictions</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-300 transition-all duration-300 ">
          <CardHeader>
            <CardTitle className="font-display font-semibold text-ink-900">{t('users')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className=" text-ink-600">{t('usersDesc')}</p>
            <ol className="space-y-2 text-sm text-ink-600 list-decimal list-inside">
              <li>Aller dans Supabase Dashboard → Authentication → Users</li>
              <li>Cliquer "Invite user" ou créer un compte</li>
              <li>L'utilisateur pourra se connecter sur /login</li>
              <li>Tous les utilisateurs authentifiés ont accès admin (RLS: auth.uid() is not null)</li>
            </ol>
            <p className="text-sm text-terracotta-600 bg-terracotta-50 rounded-lg p-3">{t('restrictNote')}</p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 border-t border-ink-200 pt-6">
          <Button type="submit" disabled={isSaving} size="lg" className="hover:border-accent-300">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}