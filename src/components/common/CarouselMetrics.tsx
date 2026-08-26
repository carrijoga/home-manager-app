import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Componente de Carrossel para Métricas do Dashboard
 *
 * Features:
 * - Navegação por setas (← →)
 * - Indicadores de página (bolinhas)
 * - Auto-play pausável (5s)
 * - Pausa ao hover
 * - Navegação por teclado
 * - Swipe em mobile
 * - Loop infinito
 */

interface CarouselMetricsProps {
  children: React.ReactNode[];
  autoPlayDelay?: number;
  stopButton?: boolean;
  className?: string;
}

export default function CarouselMetrics({
  children,
  autoPlayDelay = 5000,
  stopButton = false,
  className,
}: CarouselMetricsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: autoPlayDelay, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Estado para saber se está tocando
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Play/Pause botão
  const handlePlayPauseClick = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    setIsPlaying((prev) => {
      const next = !prev;

      if (!next) {
        autoplay.stop();
      } else if (!isHovered) {
        autoplay.play();
      }

      return next;
    });
  }, [emblaApi, isHovered]);

  // Pausa ao hover
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (autoplay && isPlaying) autoplay.stop();
  }, [emblaApi, isPlaying]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (autoplay && isPlaying) autoplay.play();
  }, [emblaApi, isPlaying]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('relative max-w-full', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Viewport do Carrossel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex items-stretch">
          {children.map((child, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-[0_0_100%] pl-4 md:flex-[0_0_50%] lg:flex-[0_0_25%]"
            >
              <div className="w-full">{child}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de Navegação */}
      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2',
            'z-10 rounded-full p-2',
            'bg-background/90',
            'border border-border',
            'shadow-lg',
            'hover:bg-background',
            'hover:scale-110',
            'duration-[length:var(--dur-base)] transition-all',
            'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}

      {canScrollNext && (
        <button
          onClick={scrollNext}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'z-10 rounded-full p-2',
            'bg-background/90',
            'border border-border',
            'shadow-lg',
            'hover:bg-background',
            'hover:scale-110',
            'duration-[length:var(--dur-base)] transition-all',
            'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          aria-label="Próximo"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* Indicadores de Página (Dots) */}
      <div className="mt-4 flex justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              'duration-[length:var(--dur-base)] h-2 w-2 rounded-full transition-all',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              index === selectedIndex ? 'w-8 bg-primary' : 'bg-border hover:bg-muted-foreground'
            )}
            aria-label={`Ir para slide ${index + 1}`}
            aria-current={index === selectedIndex ? 'true' : 'false'}
          />
        ))}

        {!stopButton && (
          <button
            onClick={handlePlayPauseClick}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full',
              'duration-[length:var(--dur-base)] transition-all',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              isPlaying
                ? 'bg-primary/20 hover:bg-primary/30'
                : 'bg-border hover:bg-muted-foreground/30'
            )}
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 text-foreground" />
            ) : (
              <Play className="h-3 w-3 text-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
