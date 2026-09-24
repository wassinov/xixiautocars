'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CarImage } from '@/types/car';

interface ImageGalleryProps {
  images: CarImage[];
  carName: string;
}

export function ImageGallery({ images, carName }: ImageGalleryProps) {
  const t = useTranslations('car.gallery'); // BUG-23 (Étape 34) : galerie traduite ×4
  const sortedImages = [...images].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const primaryIndex = sortedImages.findIndex((img) => img.is_primary);
  const startIndex = primaryIndex >= 0 ? primaryIndex : 0;

  const goTo = useCallback((index: number) => {
    setCurrentIndex((index + sortedImages.length) % sortedImages.length);
  }, [sortedImages.length]);

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, next, prev]);

  // BUG-34 : scroll-lock du body tant que le plein écran est ouvert
  useEffect(() => {
    if (!isFullscreen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isFullscreen]);

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-vehicle bg-ink-100 rounded-2xl hover:border-accent-300 flex items-center justify-center">
        <span className="text-ink-400">{t('noImages')}</span>
      </div>
    );
  }

  const currentImage = sortedImages[currentIndex];

  return (
    <div className="relative">
      {/* Main image */}
      <div className="relative aspect-vehicle bg-ink-100 rounded-2xl hover:border-accent-300 overflow-hidden">
        <Image
          src={currentImage.image_url}
          alt={`${carName} - ${t('imageOf', { current: currentIndex + 1, total: sortedImages.length })}`}
          fill
          className="object-cover transition-opacity duration-300 "
          priority={currentIndex === startIndex}
          sizes="(max-width: 768px) 100vw, 60vw"
        />

        {/* Navigation arrows */}
        {sortedImages.length > 1 && !isFullscreen && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ink-900 "
              onClick={prev}
              aria-label={t('previous')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ink-900 "
              onClick={next}
              aria-label={t('next')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Close fullscreen */}
        {isFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-50 bg-white/90 hover:bg-white text-ink-900 "
            onClick={() => setIsFullscreen(false)}
            aria-label={t('closeFullscreen')}
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Dots indicator */}
        {sortedImages.length > 1 && !isFullscreen && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sortedImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'h-1.5 w-1.5 rounded-full hover:border-accent-300 transition-all',
                  i === currentIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'
                )}
                aria-label={t('goToImage', { index: i + 1 })}
                aria-current={i === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && !isFullscreen && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory" role="list" aria-label={t('thumbnails')}>
          {sortedImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'relative flex-shrink-0 snap-center w-24 h-[4.5rem] rounded-lg overflow-hidden border-2 transition-all',
                i === currentIndex ? 'border-accent-600 ring-2 ring-accent-600/20' : 'border-transparent hover:border-ink-300'
              )}
              aria-label={t('viewImage', { index: i + 1 })}
              aria-current={i === currentIndex ? 'true' : 'false'}
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
              {img.is_primary && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium text-white bg-accent-600 rounded-full hover:border-accent-300">
                  {t('primary')}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen trigger */}
      {sortedImages.length > 1 && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full justify-center gap-2 text-ink-600 hover:text-accent-600"
          onClick={() => setIsFullscreen(true)}
        >
          <Expand className="h-4 w-4" />
          {t('fullscreen', { count: sortedImages.length })}
        </Button>
      )}

      {/* Fullscreen modal — téléporté dans <body> (BUG-34) : les ancêtres animés
          (animate-reveal, fill-mode forwards → transform translateY(0) figé) deviennent
          le référentiel des position:fixed descendants → le modal était confiné dans
          la section. createPortal l'extrait de l'arbre DOM → fixed = viewport réel */}
      {isFullscreen &&
        createPortal(
        <div
          className="fixed inset-0 z-50 bg-ink-950/95 flex flex-col items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={t('galleryOf', { name: carName })}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-accent-400"
            onClick={() => setIsFullscreen(false)}
            aria-label={t('close')}
          >
            <X className="h-7 w-7" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:text-accent-400"
            onClick={prev}
            aria-label={t('previous')}
            disabled={sortedImages.length <= 1}
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>

          <div className="relative">
            <Image
              src={currentImage.image_url}
              alt={`${carName} - ${t('imageOf', { current: currentIndex + 1, total: sortedImages.length })}`}
              width={1200}
              height={900}
              className="object-contain"
              style={{ width: 'auto', height: 'auto', maxWidth: '90vw', maxHeight: '80vh' }}
              priority
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:text-accent-400"
            onClick={next}
            aria-label={t('next')}
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
                  'relative flex-shrink-0 snap-center w-28 h-20 rounded-lg overflow-hidden border-2 transition-all',
                  i === currentIndex ? 'border-accent-600' : 'border-transparent hover:border-white/30'
                )}
                aria-label={t('goToImage', { index: i + 1 })}
              >
                <Image src={img.image_url} alt="" fill className="object-cover" sizes="112px" />
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-ink-400 text-sm">
            {currentIndex + 1} / {sortedImages.length}
          </p>
        </div>,
        document.body
      )}
    </div>
  );
}