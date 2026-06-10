// src/components/modals/transaction-sheet/MoreDetails.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface MoreDetailsProps {
  isOpen: boolean;
  onToggle: () => void;
  hint: string;
  children: React.ReactNode;
}

export function MoreDetails({ isOpen, onToggle, hint, children }: MoreDetailsProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="border border-dashed border-border/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div>
          <span className="text-sm text-muted-foreground font-medium">Mais detalhes</span>
          {!isOpen && (
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">{hint}</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-muted-foreground/50" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="details"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
