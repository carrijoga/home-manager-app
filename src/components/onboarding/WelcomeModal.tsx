import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Compass,
  DollarSign,
  HeartHandshake,
  Home,
  Lightbulb,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface Slide {
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  description: string;
  renderIllustration: () => React.ReactNode;
}

export function WelcomeModal() {
  const { user } = useApp();
  const { isInitialModalOpen, completeInitial } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);

  const userName = user?.callmeby || user?.name?.split(' ')[0] || 'você';

  const slides: Slide[] = [
    {
      badge: 'Bem-vindo ao Ninho',
      badgeIcon: Sparkles,
      title: `Olá, ${userName}! Seu lar em perfeita sintonia ✨`,
      description:
        'O Ninho foi criado para transformar a rotina da sua casa em algo simples, colaborativo e prazeroso para toda a família.',
      renderIllustration: () => (
        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-b from-primary/10 via-primary/5 to-transparent p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner">
              <Home className="h-8 w-8" />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <HeartHandshake className="h-4 w-4" /> Gestão Doméstica Compartilhada
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tarefas, compras e finanças sem ruídos ou esquecimentos.
            </p>
          </motion.div>
        </div>
      ),
    },
    {
      badge: 'Módulos Integrados',
      badgeIcon: Compass,
      title: 'Tudo o que sua casa precisa em um só lugar',
      description:
        'Cada cantinho do app foi pensado para facilitar um pilar importante da sua rotina.',
      renderIllustration: () => (
        <div className="grid grid-cols-2 gap-3 py-1">
          <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-card/60 p-3 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Tarefas & Rotinas</h4>
              <p className="text-[11px] text-muted-foreground">Quadro Kanban colaborativo</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-card/60 p-3 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Finanças do Lar</h4>
              <p className="text-[11px] text-muted-foreground">Despesas, contas e metas</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-card/60 p-3 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Lista de Compras</h4>
              <p className="text-[11px] text-muted-foreground">Atualização em tempo real</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-card/60 p-3 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <StickyNote className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Mural de Recados</h4>
              <p className="text-[11px] text-muted-foreground">Post-its e avisos no ninho</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Dicas Interativas',
      badgeIcon: Lightbulb,
      title: 'Tours guiados para te acompanhar',
      description:
        'Ao acessar cada tela pela primeira vez, mostraremos um tour rápido com os pontos principais. Você também pode rever o guia quando quiser pelo botão de ajuda.',
      renderIllustration: () => (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">
              Você tem controle total sobre o seu ritmo
            </p>
            <p className="text-[11px] text-muted-foreground">
              Pule os tutoriais ou avance passo a passo quando se sentir confortável.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;
  const BadgeIcon = slide.badgeIcon;

  const handleNext = () => {
    if (isLast) {
      completeInitial();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <Dialog open={isInitialModalOpen} onOpenChange={(open) => !open && completeInitial()}>
      <DialogContent
        hideBuiltinClose
        className="max-w-lg overflow-hidden border-border/60 bg-card p-0 shadow-2xl rounded-2xl"
      >
        <VisuallyHidden.Root>
          <DialogTitle>Bem-vindo ao Ninho</DialogTitle>
        </VisuallyHidden.Root>

        <div className="relative flex flex-col p-6 sm:p-8">
          {/* Header com Badge e Indicadores */}
          <div className="flex items-center justify-between pb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <BadgeIcon className="h-3.5 w-3.5" />
              <span>{slide.badge}</span>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Ir para o slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Conteúdo animado */}
          <div className="min-h-[300px] flex flex-col justify-between py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {slide.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {slide.description}
                  </p>
                </div>

                {slide.renderIllustration()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Ações / Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={completeInitial}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pular introdução
            </button>

            <div className="flex items-center gap-2">
              {currentSlide > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="text-xs"
                >
                  Voltar
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="gap-1.5 px-4 text-xs font-semibold shadow-xs"
              >
                {isLast ? (
                  <>
                    <span>Começar a Explorar</span>
                    <CheckCircle2 className="h-4 w-4" />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
