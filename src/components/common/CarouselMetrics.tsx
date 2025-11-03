import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  className?: string;
}

export default function CarouselMetrics({
  children,
  autoPlayDelay = 5000,
  className,
}: CarouselMetricsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
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
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Pausa ao hover
  const handleMouseEnter = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (autoplay) autoplay.stop();
  }, [emblaApi]);

  const handleMouseLeave = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (autoplay) autoplay.play();
  }, [emblaApi]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext]);

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Viewport do Carrossel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 items-stretch">
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_25%] flex"
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
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2",
            "z-10 p-2 rounded-full",
            "bg-white/90 dark:bg-dark-bg-secondary/90",
            "border border-gray-200 dark:border-dark-border",
            "shadow-lg",
            "hover:bg-white dark:hover:bg-dark-bg-secondary",
            "hover:scale-110",
            "transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-dark-accent-indigo",
            "opacity-0 group-hover:opacity-100"
          )}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-dark-text-primary" />
        </button>
      )}

      {canScrollNext && (
        <button
          onClick={scrollNext}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-2",
            "z-10 p-2 rounded-full",
            "bg-white/90 dark:bg-dark-bg-secondary/90",
            "border border-gray-200 dark:border-dark-border",
            "shadow-lg",
            "hover:bg-white dark:hover:bg-dark-bg-secondary",
            "hover:scale-110",
            "transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-dark-accent-indigo",
            "opacity-0 group-hover:opacity-100"
          )}
          aria-label="Próximo"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-dark-text-primary" />
        </button>
      )}

      {/* Indicadores de Página (Dots) */}
      <div className="flex justify-center gap-2 mt-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-dark-accent-indigo",
              index === selectedIndex
                ? "bg-indigo-600 dark:bg-dark-accent-indigo w-8"
                : "bg-gray-300 dark:bg-dark-border hover:bg-gray-400 dark:hover:bg-gray-600"
            )}
            aria-label={`Ir para slide ${index + 1}`}
            aria-current={index === selectedIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}
