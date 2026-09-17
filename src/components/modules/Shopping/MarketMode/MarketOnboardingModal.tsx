import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Lightbulb,
  Pencil,
  Scale,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface MarketOnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

interface Step {
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

const ONBOARDING_KEY = 'ninho_market_mode_onboarding_v1';

export function hasCompletedMarketOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function setMarketOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export function MarketOnboardingModal({ open, onClose }: MarketOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      badge: 'Foco no Supermercado',
      badgeColor: 'text-[#C1714D] bg-[#C1714D]/10 border-[#C1714D]/30',
      icon: ShoppingBag,
      title: 'Projetado para usar com uma mão 🛒',
      description:
        'Todos os controles principais e o carrinho flutuante ficam no alcance do seu polegar, para você empurrar o carrinho com uma mão e usar a lista com a outra.',
      illustration: (
        <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-linear-to-b from-[#C1714D]/15 to-transparent p-4 border border-[#C1714D]/20">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#C1714D]/20 border border-[#C1714D]/30 flex items-center justify-center text-[#C1714D] shadow-sm">
              <ShoppingBag size={28} />
            </div>
            <span className="text-xs font-bold text-foreground">Operação Tátil e Ágil</span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Balança & Etiqueta',
      badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: Scale,
      title: 'Preço na Balança ou Unitário ⚖️',
      description:
        'Pese frutas ou frios e digite o valor total da etiqueta ou o preço unitário. O Ninho faz o cálculo automático e ajusta seu total gasto em tempo real.',
      illustration: (
        <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-linear-to-b from-emerald-500/15 to-transparent p-4 border border-emerald-500/20">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm">
              <Scale size={28} />
            </div>
            <span className="text-xs font-bold text-foreground">Etiqueta de Balança ou Preço Unitário</span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Unidades Flexíveis',
      badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Pencil,
      title: 'Ajuste a Unidade na Hora ✏️',
      description:
        'Colocou dúzia e na verdade vende por pacote? No drawer de compra você pode tocar na unidade e mudar para pct, kg, un ou g em 1 toque.',
      illustration: (
        <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-linear-to-b from-amber-500/15 to-transparent p-4 border border-amber-500/20">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Pencil size={28} />
            </div>
            <span className="text-xs font-bold text-foreground">Troque un, kg, dz, pct sem atrito</span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Sem Interrupções',
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      icon: Lightbulb,
      title: 'Tela Sempre Acesa & Orçamento 💡',
      description:
        'Ative o botão "Tela Acesa" no topo para o celular não bloquear entre os corredores. Ao terminar, finalize e lance o gasto direto no Ninho Financeiro!',
      illustration: (
        <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-linear-to-b from-amber-500/15 to-transparent p-4 border border-amber-500/20">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Lightbulb size={28} />
            </div>
            <span className="text-xs font-bold text-foreground">Tela sempre ligada + Resumo Financeiro</span>
          </div>
        </div>
      ),
    },
  ];

  const handleFinish = () => {
    setMarketOnboardingCompleted();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleFinish()}>
      <DialogContent className="max-w-sm rounded-3xl border border-border/80 bg-card p-6 shadow-2xl dark:bg-[#1B1A18] overflow-hidden">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${step.badgeColor}`}>
              <StepIcon size={12} />
              {step.badge}
            </span>
          </div>
          <button
            onClick={handleFinish}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <DialogTitle className="sr-only">Onboarding do Modo Mercado</DialogTitle>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5 pt-1"
          >
            {step.illustration}

            <div className="space-y-1.5 text-left">
              <h3 className="font-display text-lg font-bold text-foreground tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicadores de bolinhas */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir para passo ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="h-9 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Voltar
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-1"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check size={14} /> Começar Compras!
                </>
              ) : (
                <>
                  Próximo <ArrowRight size={13} />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
