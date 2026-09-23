import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SpotlightTour() {
  const { activeTour, currentStep, currentStepIndex, nextStep, prevStep, skipTour } =
    useOnboarding();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 100,
    left: 100,
  });

  const totalSteps = activeTour?.steps.length ?? 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Atualiza posição do elemento alvo
  const updatePosition = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.target);
    if (!element) {
      // Elemento não encontrado na tela atual — posiciona no centro
      setTargetRect(null);
      setTooltipPos({
        top: Math.max(80, window.innerHeight / 2 - 120),
        left: Math.max(16, window.innerWidth / 2 - 170),
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = currentStep.padding ?? 8;

    const paddedRect: TargetRect = {
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    setTargetRect(paddedRect);

    // Calcula posição do tooltip
    const tooltipWidth = 340;
    const tooltipHeight = 180;
    const margin = 12;

    let top = 0;
    let left = 0;
    const placement = currentStep.placement || 'bottom';

    if (placement === 'bottom') {
      top = paddedRect.top + paddedRect.height + margin;
      left = paddedRect.left + paddedRect.width / 2 - tooltipWidth / 2;
    } else if (placement === 'top') {
      top = paddedRect.top - tooltipHeight - margin;
      left = paddedRect.left + paddedRect.width / 2 - tooltipWidth / 2;
    } else if (placement === 'left') {
      top = paddedRect.top + paddedRect.height / 2 - tooltipHeight / 2;
      left = paddedRect.left - tooltipWidth - margin;
    } else if (placement === 'right') {
      top = paddedRect.top + paddedRect.height / 2 - tooltipHeight / 2;
      left = paddedRect.left + paddedRect.width + margin;
    }

    // Ajusta para não sair da tela
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    if (top < 16) {
      // Se estourar em cima, joga para baixo do elemento
      top = paddedRect.top + paddedRect.height + margin;
    }
    if (top + tooltipHeight > window.innerHeight - 16) {
      // Se estourar embaixo, joga para cima do elemento
      top = Math.max(16, paddedRect.top - tooltipHeight - margin);
    }

    setTooltipPos({ top, left });
  }, [currentStep]);

  // Rola o elemento para a visão ao mudar de passo
  useEffect(() => {
    if (!currentStep) return;

    const tryFocusElement = () => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
      updatePosition();
    };

    tryFocusElement();
    const timeout = setTimeout(tryFocusElement, 300);

    return () => clearTimeout(timeout);
  }, [currentStep, updatePosition]);

  // Listeners de scroll e resize para manter o tooltip grudado
  useLayoutEffect(() => {
    if (!activeTour) return;

    const handleUpdate = () => updatePosition();

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [activeTour, updatePosition]);

  // Teclado (Escape para fechar, setas para navegar)
  useEffect(() => {
    if (!activeTour) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTour, skipTour, nextStep, prevStep]);

  if (!activeTour || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
      {/* SVG Mask Overlay para corte de luz */}
      <svg
        className="fixed inset-0 h-full w-full pointer-events-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="ninho-spotlight-mask">
            {/* Fundo branco (revela o overlay escuro) */}
            <rect width="100%" height="100%" fill="white" />

            {/* Recorte preto no alvo (fica transparente / spotlight) */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Retângulo escuro com a máscara aplicada */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.68)"
          mask="url(#ninho-spotlight-mask)"
        />
      </svg>

      {/* Borda brilhante ao redor do elemento em foco */}
      {targetRect && (
        <motion.div
          layoutId="spotlight-highlight-ring"
          initial={false}
          animate={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="pointer-events-none fixed rounded-xl border-2 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb,59,130,246),0.4)]"
        />
      )}

      {/* Card do Tooltip Flutuante */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
          className="fixed w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-border/80 bg-card p-4 shadow-2xl text-foreground"
        >
          {/* Header do Card */}
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Passo {currentStepIndex + 1} de {totalSteps}
              </span>
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">
                {activeTour.title}
              </span>
            </div>

            <button
              type="button"
              onClick={skipTour}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Pular tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Corpo */}
          <div className="py-3 space-y-1.5">
            <h4 className="text-sm font-bold text-foreground leading-snug">
              {currentStep.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Rodapé / Botões */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={skipTour}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular tour
            </button>

            <div className="flex items-center gap-1.5">
              {currentStepIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="h-8 px-2.5 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Anterior
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={nextStep}
                className="h-8 px-3 text-xs font-semibold gap-1"
              >
                {isLastStep ? (
                  <>
                    <span>Entendi!</span>
                    <Check className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Próximo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
