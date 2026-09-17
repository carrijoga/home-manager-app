import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { getMonthLabel } from '@/utils/financialUtils';

interface MonthNavigatorProps {
  month: Date;
  onChange: (month: Date) => void;
}

/** Navegador de período ‹ Junho 2026 › — controla o filtro de mês da tela com transição direcional suave. */
export function MonthNavigator({ month, onChange }: MonthNavigatorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [direction, setDirection] = useState<number>(0);

  const shift = (delta: number) => {
    setDirection(delta);
    onChange(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  };

  const label = getMonthLabel(month);
  const key = `${month.getFullYear()}-${month.getMonth()}`;

  const slideVariants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 14 : -14,
      opacity: 0,
      filter: prefersReducedMotion ? 'none' : 'blur(2px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? -14 : 14,
      opacity: 0,
      filter: prefersReducedMotion ? 'none' : 'blur(2px)',
    }),
  };

  return (
    <div className="flex items-center gap-1">
      <motion.button
        type="button"
        aria-label="Mês anterior"
        whileTap={{ scale: 0.88 }}
        onClick={() => shift(-1)}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </motion.button>

      <div className="min-w-[170px] overflow-hidden text-center">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.h2
            key={key}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
              mass: 0.8,
            }}
            className="font-editorial text-xl font-bold text-foreground select-none"
          >
            {label}
          </motion.h2>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        aria-label="Próximo mês"
        whileTap={{ scale: 0.88 }}
        onClick={() => shift(1)}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </motion.button>
    </div>
  );
}
