'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: { id: string; image_url: string; is_primary: boolean; order_index: number }[];
  carName: string;
}

export function ImageGallery({ images, carName }: ImageGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.order_index - b.order_index);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const primaryIndex = sortedImages.findIndex((img) => img.is_primary);
  const startIndex = primaryIndex >= 0 ? primaryIndex : 0;

  const goTo = useCallback((index: number) => {
    setCurrentIndex((index + sortedImages.length) % sortedImages.length);
  }, [sortedImages.length]);

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center">
        <span className="text-neutral-400">Aucune image disponible</span>
      </div>
    );
  }

  const currentImage = sortedImages[currentIndex];

  return (
    <div className="relative">
      <div className="relative aspect-video bg-neutral-100 rounded-xl overflow-hidden">
        <Image
          src={currentImage.image_url}
          alt={`${carName} - Image ${currentIndex + 1} sur ${sortedImages.length}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority={currentIndex === startIndex}
          sizes="(max-width: 768px) 100vw, 60vw"
        />

        {sortedImages.length > 1 && !isFullscreen && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
              onClick={prev}
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
              onClick={next}
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {isFullscreen && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-white shadow-md"
            onClick={() => setIsFullscreen(false)}
            aria-label="Fermer le plein écran"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {sortedImages.length > 1 && !isFullscreen && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sortedImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all',
                  i === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Aller à l'image ${i + 1}`}
                aria-current={i === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>

      {sortedImages.length > 1 && !isFullscreen && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory" role="list" aria-label="Miniatures">
          {sortedImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'relative flex-shrink-0 snap-center w-20 h-15 rounded-lg overflow-hidden border-2 transition-all',
                i === currentIndex ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent hover:border-neutral-300'
              )}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === currentIndex ? 'true' : 'false'}
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
              {img.is_primary && (
                <span className="absolute top-1 left-1 px-1 py-0.5 text-[10px] font-medium text-white bg-primary-600 rounded">Principale</span>
              )}
            </button>
          ))}
        </div>
      )}

      {sortedImages.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-center gap-2 text-neutral-600 hover:text-primary-600"
          onClick={() => setIsFullscreen(true)}
        >
          <Expand className="h-4 w-4" />
          Voir en plein écran ({sortedImages.length} photos)
        </Button>
      )}

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center" role="dialog" aria-modal="true" aria-label={`Galerie ${carName}`}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 text-white hover:text-primary-400"
            onClick={() => setIsFullscreen(false)}
            aria-label="Fermer"
          >
            <X className="h-7 w-7" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-6 text-white hover:text-primary-400"
            onClick={prev}
            aria-label="Image précédente"
            disabled={sortedImages.length <= 1}
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>

          <div className="relative max-h-[80vh] max-w-[90vw]">
            <Image
              src={currentImage.image_url}
              alt={`${carName} - Image ${currentIndex + 1} sur ${sortedImages.length}`}
              width={1200}
              height={900}
              className="object-contain"
              priority
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-6 text-white hover:text-primary-400"
            onClick={next}
            aria-label="Image suivante"
            disabled={sortedImages.length <= 1}
          >
            <ChevronRight className="h-10 w-10" />
          </Button>

          <div className="mt-6 flex gap-2 max-w-[90vw] overflow-x-auto pb-4 snap-x snap-mandatory">
            {sortedImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'flex-shrink-0 snap-center w-24 h-16 rounded-lg overflow-hidden border-2 transition-all',
                  i === currentIndex ? 'border-primary-500' : 'border-transparent hover:border-white/50'
                )}
                aria-label={`Aller à l'image ${i + 1}`}
              >
                <Image src={img.image_url} alt="" fill className="object-cover" sizes="96px" />
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-white/70 text-sm">
            {currentIndex + 1} / {sortedImages.length}
          </p>
        </div>
      )}
    </div>
  );
}