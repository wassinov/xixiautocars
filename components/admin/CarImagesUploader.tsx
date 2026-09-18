'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, Trash2, Star, Loader2, Check, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { uploadCarImage, deleteCarImage, setPrimaryImage } from '@/app/actions/upload';
import { useTranslations } from 'next-intl';

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

interface CarImagesUploaderProps {
  carId?: string;
  images: CarImage[];
  onImagesChange: (images: CarImage[]) => void;
}

export default function CarImagesUploader({ carId, images, onImagesChange }: CarImagesUploaderProps) {
  const t = useTranslations('admin.carForm');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [settingPrimaryIds, setSettingPrimaryIds] = useState<Set<string>>(new Set());

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!carId) return;
    
    setIsUploading(true);
    for (const file of acceptedFiles) {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[file.name] || 0;
          if (current < 90) return { ...prev, [file.name]: current + 10 };
          return prev;
        });
      }, 100);

      const result = await uploadCarImage(carId, file, images.length);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

      if (result.error) {
        toast({ title: t('error'), description: result.error, variant: 'destructive' });
      } else if (result.data) {
        onImagesChange([...images, result.data]);
        toast({ title: t('success'), description: t('imageAdded') });
      }
    }
    setIsUploading(false);
    setUploadProgress({});
  }, [carId, images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5 MB
    disabled: !carId || isUploading,
  });

  const handleDelete = async (image: CarImage) => {
    if (!confirm(t('confirmDelete'))) return;

    setDeletingIds(prev => new Set(prev).add(image.id));
    const result = await deleteCarImage(image.id, image.image_url);
    setDeletingIds(prev => { const next = new Set(prev); next.delete(image.id); return next; });

    if (result.error) {
      toast({ title: t('error'), description: result.error, variant: 'destructive' });
    } else {
      onImagesChange(images.filter(img => img.id !== image.id));
      toast({ title: t('success'), description: t('imageDeleted') });
    }
  };

  const handleSetPrimary = async (image: CarImage) => {
    if (!carId) return;
    
    setSettingPrimaryIds(prev => new Set(prev).add(image.id));
    const result = await setPrimaryImage(carId, image.id);
    setSettingPrimaryIds(prev => { const next = new Set(prev); next.delete(image.id); return next; });

    if (result.error) {
      toast({ title: t('error'), description: result.error, variant: 'destructive' });
    } else {
      onImagesChange(images.map(img => ({
        ...img,
        is_primary: img.id === image.id
      })));
      toast({ title: t('success'), description: t('imageSetPrimary') });
    }
  };

  const isDisabled = !carId || isUploading;

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} disabled={isDisabled} />
        <ImageIcon className={cn('h-12 w-12 mx-auto text-neutral-400 mb-4', isDisabled && 'opacity-50')} />
        <p className="text-lg font-medium text-neutral-900">
          {isDragActive ? t('dropImagesHere') : t('dragDropImagesHere')}
        </p>
        <p className="text-neutral-500 mt-1">{t('orClickToSelect')}</p>
        <p className="text-xs text-neutral-400 mt-2">{t('fileFormats')}</p>
        
        {isUploading && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="flex items-center gap-2 text-sm">
                <span className="text-neutral-600 truncate max-w-[200px]">{fileName}</span>
                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-neutral-500 w-10 text-right">{progress}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message si pas de carId */}
      {!carId && (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-neutral-600 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {t('saveVehicleFirst')}
          </p>
        </div>
      )}

      {/* Grille d'images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-700">{t('imagesCount', { count: images.length })}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  'relative group bg-white border rounded-xl overflow-hidden transition-shadow',
                  image.is_primary ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-neutral-200 hover:shadow-md'
                )}
              >
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={`${t('image')} ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  {image.is_primary && (
                    <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-full">
                      {t('primary')}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-black/60 rounded-full">
                    #{index + 1}
                  </span>
                  {/* Overlay de survol - DANS la zone image, pas après */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-3 space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="primary"
                        checked={image.is_primary}
                        onChange={() => handleSetPrimary(image)}
                        disabled={settingPrimaryIds.has(image.id)}
                        className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-neutral-700">{t('primary')}</span>
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSetPrimary(image)}
                      disabled={settingPrimaryIds.has(image.id) || image.is_primary}
                      aria-label={image.is_primary ? t('alreadyPrimary') : t('setAsPrimary')}
                    >
                      {settingPrimaryIds.has(image.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className={cn('h-4 w-4', image.is_primary ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-400')} />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); handleDelete(image); }}
                      disabled={deletingIds.has(image.id)}
                      aria-label={t('deleteImage')}
                    >
                      {deletingIds.has(image.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && carId && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-neutral-500">{t('noImages')}</p>
          <p className="text-sm text-neutral-400 mt-1">{t('addFirstImage')}</p>
        </div>
      )}
    </div>
  );
}