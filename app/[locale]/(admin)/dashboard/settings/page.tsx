import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Truck, Building, MapPin, Phone, Mail, Clock, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = { title: 'Settings - Mon Garage Admin', description: 'Garage configuration and general settings' };

export const dynamic = 'force-dynamic';

const garageSchema = z.object({ name: z.string().min(2), address: z.string().optional(), phone: z.string().optional(), email: z.string().email().optional().or(z.literal('')), google_maps_url: z.string().url().optional().or(z.literal('')), opening_hours: z.string().optional(), about_text: z.string().optional(), logo_url: z.string().url().optional().or(z.literal('')) });

type GarageFormData = z.infer<typeof garageSchema>;

async function getGarage() {
  const supabase = await createClient();
  const { data } = await supabase.from('garage_infos').select('*').eq('id', '00000000-0000-0000-0000-000000000000').single();
  return data;
}

async function updateGarage(data: GarageFormData) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('garage_infos').upsert({ id: '00000000-0000-0000-0000-000000000000', ...data });
  return error;
}

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin.settings');
  const tCommon = await getTranslations('common');
  const garage = await getGarage();

  const defaultGarage = { name: 'Mon Garage', address: '123 Rue de l\'Automobile', phone: '01 23 45 67 89', email: 'contact@mongarage.fr', google_maps_url: 'https://maps.google.com/?q=123+Rue+de+l\'Automobile', opening_hours: 'Lundi-Vendredi: 9h-19h, Samedi: 9h-18h', about_text: 'Nous sommes un garage familial passionné par les automobiles depuis 1980.', logo_url: '/images/garage-logo.png' };
  const garageData = garage || defaultGarage;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1>
        <p className="mt-1 text-neutral-600">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t('info')}</CardTitle>
          <Building className="h-5 w-5 text-neutral-400" />
        </CardHeader>
        <CardContent>
          <form action={`/${locale}/api/admin/garage`} method="POST" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')} <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" value={garageData.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input id="phone" name="phone" type="tel" value={garageData.phone} placeholder="01 23 45 67 89" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Textarea id="address" name="address" value={garageData.address} rows={2} placeholder="123 Rue de l'Automobile, 75000 Paris" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" name="email" type="email" value={garageData.email} placeholder="contact@mongarage.fr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_maps_url">{t('mapsUrl')}</Label>
                <Input id="google_maps_url" name="google_maps_url" value={garageData.google_maps_url} placeholder="https://maps.google.com/?q=..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="opening_hours">{t('hours')}</Label>
              <Textarea id="opening_hours" name="opening_hours" value={garageData.opening_hours} rows={3} placeholder="Lundi-Vendredi: 9h-19h&#10;Samedi: 9h-18h&#10;Dimanche: Fermé" />
              <p className="text-xs text-neutral-500">{t('hoursHelp')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="about_text">{t('about')}</Label>
              <Textarea id="about_text" name="about_text" value={garageData.about_text} rows={4} placeholder="Histoire, valeurs, expertise..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">{t('logoUrl')}</Label>
              <Input id="logo_url" name="logo_url" value={garageData.logo_url} placeholder="https://..." />
              <p className="text-xs text-neutral-500">{t('logoHelp')}</p>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit"><Save className="mr-2 h-4 w-4" />{t('save')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />{t('storage')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">{t('bucketInfo')} <code className="text-primary-600">car-images</code></h4>
            <ul className="text-sm text-neutral-600 space-y-1">
              {(t('bucketDetails') as unknown as string[]).map((item, i) => <li key={i}>• {item}</li>)}
            </ul>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">{t('rlsTitle')}</h4>
            <pre className="text-xs bg-neutral-100 p-3 rounded overflow-x-auto"><code>{`-- Public read
create policy "Public read" on storage.objects for select
using (bucket_id = 'car-images');

-- Auth upload
create policy "Auth upload" on storage.objects for insert
with check (bucket_id = 'car-images' and auth.uid() is not null);

-- Auth delete
create policy "Auth delete" on storage.objects for delete
using (bucket_id = 'car-images' and auth.uid() is not null);`}</code></pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('users')}</CardTitle></CardHeader>
        <CardContent>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600 mb-4">{t('usersDesc')}</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
              {(t('usersSteps') as unknown as string[]).map((step, i) => <li key={i}>{step}</li>)}
            </ol>
            <p className="text-xs text-neutral-500 mt-4">{t('restrictNote')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}