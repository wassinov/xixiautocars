'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Image as ImageIcon, ArrowLeft, Upload, Check, X, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface CarImage { id: string; car_id: string; image_url: string; is_primary: boolean; order_index: number; }

export default function CarImagesPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;
  const locale = params.locale as string;
  const t = useTranslations('admin.carImages');
  const tCommon = useTranslations('common');

  const [images, setImages] = useState<CarImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadImages(); }, [carId]);

  const loadImages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('car_images').select('*').eq('car_id', carId).order('order_index');
    if (error) toast({ title: tCommon('error'), description: error.message, variant: 'destructive' });
    else setImages(data || []);
    setIsLoading(false);
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); };

  const handleDrop = async (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); const files = Array.from(e.dataTransfer.files); await uploadFiles(files); };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files || []); await uploadFiles(files); e.target.value = ''; };

  const uploadFiles = async (files: File[]) => { if (files.length === 0) return; setIsUploading(true); for (const file of files) { if (!file.type.startsWith('image/')) continue; const fileExt = file.name.split('.').pop(); const fileName = `${carId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`; const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, file, { cacheControl: '3600', upsert: false }); if (uploadError) { toast({ title: 'Upload error', description: uploadError.message, variant: 'destructive' }); continue; } const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(fileName); const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.order_index)) : 0; const isFirst = images.length === 0; const { error: insertError } = await supabase.from('car_images').insert({ car_id: carId, image_url: publicUrl, is_primary: isFirst, order_index: maxOrder + 1 }); if (insertError) toast({ title: tCommon('error'), description: insertError.message, variant: 'destructive' }); } await loadImages(); toast({ title: tCommon('success'), description: `${files.length} image(s) uploaded` }); setIsUploading(false); };

  const setPrimary = async (imageId: string) => { await supabase.from('car_images').update({ is_primary: false }).eq('car_id', carId); const { error } = await supabase.from('car_images').update({ is_primary: true }).eq('id', imageId); if (!error) await loadImages(); };

  const deleteImage = async (imageId: string) => { if (!confirm(t('deleteConfirm'))) return; const image = images.find(i => i.id === imageId); if (!image) return; const fileName = image.image_url.split('/car-images/')[1]; if (fileName) await supabase.storage.from('car-images').remove([fileName]); const { error } = await supabase.from('car_images').delete().eq('id', imageId); if (error) toast({ title: tCommon('error'), description: error.message, variant: 'destructive' }); else { await loadImages(); toast({ title: tCommon('deleted'), description: tCommon('imageDeleted') }); } };

  const reorderImages = async (newImages: CarImage[]) => { const updates = newImages.map((img, index) => supabase.from('car_images').update({ order_index: index }).eq('id', img.id)); await Promise.all(updates); await loadImages(); };

  const handleDragStart = (e: React.DragEvent, image: CarImage) => { e.dataTransfer.setData('text/plain', image.id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDropReorder = (e: React.DragEvent, targetImage: CarImage) => { e.preventDefault(); const draggedId = e.dataTransfer.getData('text/plain'); if (draggedId === targetImage.id) return; const newImages = [...images]; const draggedIndex = newImages.findIndex(i => i.id === draggedId); const targetIndex = newImages.findIndex(i => i.id === targetImage.id); const [draggedItem] = newImages.splice(draggedIndex, 1); newImages.splice(targetIndex, 0, draggedItem); setImages(newImages); reorderImages(newImages); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/dashboard/cars`} className="p-2 hover:bg-neutral-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1><p className="text-neutral-600">{t('subtitle')}</p></div>
      </div>

      <Card><CardHeader><CardTitle>{t('uploadTitle')}</CardTitle></CardHeader><CardContent>
        <div className={cn('border-2 border-dashed rounded-xl p-8 text-center transition-colors', dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400')} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" id="image-upload" disabled={isUploading} />
          <label htmlFor="image-upload" className="cursor-pointer"><Upload className="h-12 w-12 mx-auto text-neutral-400 mb-4" /><p className="text-lg font-medium text-neutral-900">{t('dragDrop')}</p><p className="text-neutral-500 mt-1">{t('orClick')}</p><p className="text-xs text-neutral-400 mt-2">{t('formats')}</p></label>
          {isUploading && <div className="mt-4 flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>{t('uploading')}</span></div>}
        </div>
      </CardContent></Card>

      {isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div> : images.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><ImageIcon className="h-12 w-12 mx-auto text-neutral-400 mb-4" /><p className="text-neutral-500">{t('noImages')}</p><p className="text-sm text-neutral-400 mt-1">{t('addFirst')}</p></CardContent></Card>
      ) : (
        <Card><CardHeader><CardTitle>{t('title')} ({images.length})</CardTitle></CardHeader><CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className={cn('relative group bg-white border rounded-xl overflow-hidden transition-shadow', image.is_primary ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-neutral-200 hover:shadow-md')} draggable onDragStart={(e) => handleDragStart(e, image)} onDragOver={handleDragOver} onDrop={(e) => handleDropReorder(e, image)}>
                <div className="aspect-video relative overflow-hidden"><Image src={image.image_url} alt={`Image ${index + 1}`} fill className="object-cover transition-transform duration-200 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />{image.is_primary && <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-full">{t('primary')}</span>}<span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-black/60 rounded-full">#{index + 1}</span></div>
                <div className="p-3 space-y-2"><div className="flex items-center justify-between"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="primary" checked={image.is_primary} onChange={() => setPrimary(image.id)} className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500" /><span className="text-sm font-medium text-neutral-700">{t('primary')}</span></label></div><div className="flex items-center justify-end gap-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => deleteImage(image.id)} disabled={isUploading}><Trash2 className="h-4 w-4 text-red-600" /></Button></div></div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpDown className="h-8 w-8 text-white" /></div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}