'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import CarImagesUploader from '@/components/admin/CarImagesUploader';

const carSchema = z.object({
  // brand_id is used only for UI filtering, NOT sent to database (cars table has only model_id)
  brand_id: z.string().uuid().optional(),
  model_id: z.string().uuid('Model required'),
  is_new: z.boolean().default(false),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0).optional().nullable(),
  price: z.coerce.number().min(0),
  currency: z.string().default('EUR'),
  color: z.string().optional(),
  gearbox: z.string().optional(),
  fuel_type: z.string().optional(),
  description: z.string().optional(),
  features: z.record(z.unknown()).default({}),
  condition: z.string().optional(),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type CarFormData = z.infer<typeof carSchema>;

const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'E85'];
const GEARBOX_TYPES = ['Manuelle', 'Automatique', 'Séquentielle'];
const CONDITIONS = ['Excellent', 'Très bon', 'Bon', 'Correct', 'À restaurer'];

export default function CarFormPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;
  const isEditing = carId !== 'new';
  const locale = params.locale as string;
  const t = useTranslations('admin.carForm');
  const tCommon = useTranslations('common');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string; brand_id: string }[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof CarFormData, string>>>({});

  const [formData, setFormData] = useState<CarFormData>({
    brand_id: '',
    model_id: '',
    is_new: false,
    year: new Date().getFullYear(),
    mileage: null,
    price: 0,
    currency: 'EUR',
    color: '',
    gearbox: '',
    fuel_type: '',
    description: '',
    features: {},
    condition: '',
    is_available: true,
    is_featured: false,
  });

  // Images state
  const [images, setImages] = useState<Array<{ id: string; car_id: string; image_url: string; is_primary: boolean; order_index: number; created_at: string }>>([]);

  const loadImages = async (carId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('car_images')
      .select('*')
      .eq('car_id', carId)
      .order('order_index');
    setImages(data || []);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (formData.brand_id) {
      loadModels(formData.brand_id);
    } else {
      setModels([]);
      setFormData((prev) => ({ ...prev, model_id: '' }));
    }
  }, [formData.brand_id]);

  useEffect(() => {
    if (isEditing) {
      loadCar(carId);
      loadImages(carId);
    }
  }, [carId, isEditing]);

  const loadBrands = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('brands').select('id, name').order('name');
    setBrands(data || []);
  };

  const loadModels = async (brandId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from('models').select('id, name, brand_id').eq('brand_id', brandId).order('name');
    setModels(data || []);
  };

  const loadCar = async (id: string) => {
    setIsLoading(true);
    const supabase = createClient();
    // Load car with model and brand info to pre-select brand in UI
    const { data, error } = await supabase
      .from('cars')
      .select('*, models(id, name, brand_id, brands(id, name))')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast({ title: tCommon('error'), description: 'Vehicle not found', variant: 'destructive' });
      router.push(`/${locale}/dashboard/cars`);
      return;
    }

    const model = data.models;
    const brandId = model?.brand_id || '';

    setFormData({
      brand_id: brandId, // For UI pre-selection only
      model_id: data.model_id || '',
      is_new: data.is_new,
      year: data.year,
      mileage: data.mileage,
      price: data.price,
      currency: data.currency,
      color: data.color || '',
      gearbox: data.gearbox || '',
      fuel_type: data.fuel_type || '',
      description: data.description || '',
      features: data.features || {},
      condition: data.condition || '',
      is_available: data.is_available,
      is_featured: data.is_featured,
    });

    if (brandId) {
      await loadModels(brandId);
    }
    setIsLoading(false);
  };

  const validateField = (name: keyof CarFormData, value: unknown) => {
    const fieldSchema = carSchema.shape[name];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [name]: result.error.errors[0].message }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleChange = (name: keyof CarFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = carSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof CarFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0] as keyof CarFormData] = err.message;
      });
      setErrors(newErrors);
      setIsSaving(false);
      return;
    }

    const supabase = createClient();

    try {
      // Exclude brand_id from payload - cars table only has model_id, not brand_id
      const { brand_id, ...payload } = {
        ...formData,
        mileage: formData.mileage === 0 ? null : formData.mileage,
        features: formData.features || {},
      };

      console.log('PAYLOAD createCar/updateCar:', payload);

      let error;
      let newCarId: string | null = null;
      if (isEditing) {
        const { error: updateError } = await supabase.from('cars').update(payload).eq('id', carId);
        error = updateError;
      } else {
        const { data: newCar, error: insertError } = await supabase.from('cars').insert(payload).select('id').single();
        error = insertError;
        newCarId = newCar?.id || null;
      }

      if (error) throw error;

      if (isEditing) {
        toast({ title: tCommon('success'), description: tCommon('updated') });
        router.push(`/${locale}/dashboard/cars`);
        router.refresh();
      } else if (newCarId) {
        toast({ title: tCommon('success'), description: 'Véhicule créé. Ajoutez maintenant les photos.' });
        router.push(`/${locale}/dashboard/cars/${newCarId}`);
        router.refresh();
      } else {
        toast({ title: tCommon('success'), description: tCommon('created') });
        router.push(`/${locale}/dashboard/cars`);
        router.refresh();
      }
    } catch (err) {
      console.error('Error saving car:', err);
      toast({ title: tCommon('error'), description: err instanceof Error ? err.message : tCommon('saveError'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/dashboard/cars`} className="p-2 hover:bg-neutral-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{isEditing ? t('editTitle') : t('title')}</h1>
            <p className="text-neutral-600">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{t('mainInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand_id">{t('brand')} <span className="text-red-500">*</span></Label>
                <Select value={formData.brand_id} onValueChange={(v) => handleChange('brand_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectBrand')} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brand_id && <p className="text-sm text-red-500">{errors.brand_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_id">{t('model')} <span className="text-red-500">*</span></Label>
                <Select value={formData.model_id} onValueChange={(v) => handleChange('model_id', v)} disabled={!formData.brand_id}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.brand_id ? t('selectModel') : t('selectBrandFirst')} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.model_id && <p className="text-sm text-red-500">{errors.model_id}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="year">{t('year')} <span className="text-red-500">*</span></Label>
                <Input id="year" type="number" value={formData.year} onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)} min={1990} max={new Date().getFullYear() + 1} />
                {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">{t('mileage')}</Label>
                <Input id="mileage" type="number" value={formData.mileage || ''} onChange={(e) => handleChange('mileage', e.target.value ? parseInt(e.target.value) : null)} min={0} step={1000} placeholder="0" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t('price')} <span className="text-red-500">*</span></Label>
                <Input id="price" type="number" value={formData.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} min={0} step={100} />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t('currency')}</Label>
                <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={tCommon('currency')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="color">{t('color')}</Label>
                <Input id="color" value={formData.color} onChange={(e) => handleChange('color', e.target.value)} placeholder={tCommon('colorPlaceholder')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gearbox">{t('gearbox')}</Label>
                <Select value={formData.gearbox} onValueChange={(v) => handleChange('gearbox', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectGearbox')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{tCommon('notSpecified')}</SelectItem>
                    {GEARBOX_TYPES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">{t('fuel')}</Label>
                <Select value={formData.fuel_type} onValueChange={(v) => handleChange('fuel_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectFuel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{tCommon('notSpecified')}</SelectItem>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">{t('condition')}</Label>
              <Select value={formData.condition} onValueChange={(v) => handleChange('condition', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCondition')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{tCommon('notSpecified')}</SelectItem>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('description')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">{t('descriptionLabel')}</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} placeholder={tCommon('descriptionPlaceholder')} />
            </div>

            <div className="space-y-2">
              <Label>{t('features')}</Label>
              <Textarea
                value={JSON.stringify(formData.features, null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('features', JSON.parse(e.target.value));
                  } catch {
                    handleChange('features', {});
                  }
                }}
                rows={6}
                placeholder='{ "climatisation": true, "gps": true }'
                className="font-mono text-sm"
              />
              <p className="text-xs text-neutral-500">{t('featuresHelp')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section Photos */}
        <Card>
          <CardHeader>
            <CardTitle>{t('carImages')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CarImagesUploader
              carId={isEditing ? carId : undefined}
              images={images}
              onImagesChange={setImages}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('statuses')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.is_new} onCheckedChange={(c) => handleChange('is_new', c)} />
                <span>{t('isNew')}</span>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.is_featured} onCheckedChange={(c) => handleChange('is_featured', c)} />
                <span>{t('isFeatured')}</span>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.is_available} onCheckedChange={(c) => handleChange('is_available', c)} />
                <span>{t('isAvailable')}</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 border-t pt-6">
          <Link href={`/${locale}/dashboard/cars`}>
            <Button type="button" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tCommon('cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon('saving')}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {isEditing ? t('update') : t('save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}