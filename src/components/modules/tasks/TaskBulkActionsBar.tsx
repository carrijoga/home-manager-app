import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface TaskBulkActionsBarProps {
  isVisible: boolean;
  selectedCount: number;
  onClose: () => void;
  onCompleteSelected: () => void;
  onReopenSelected: () => void;
  onDeleteSelected: () => void;
}

export function TaskBulkActionsBar({
  isVisible,
  selectedCount,
  onClose,
  onCompleteSelected,
  onReopenSelected,
  onDeleteSelected,
}: TaskBulkActionsBarProps) {
  return (
    <AnimatePresence>
      {isVisible && selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-card/95 p-3 shadow-2xl backdrop-blur-md sm:bottom-12 sm:w-auto sm:flex-row sm:rounded-full sm:px-4 sm:py-2"
        >
          <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start gap-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {selectedCount}
            </span>
            <span className="text-sm font-semibold text-foreground">
              tarefa{selectedCount > 1 ? 's' : ''} selecionada{selectedCount > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-px w-full bg-border sm:h-6 sm:w-px sm:bg-border" />

          <div className="flex w-full justify-between sm:w-auto sm:justify-start sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCompleteSelected}
              className="flex-1 gap-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-500 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 sm:flex-none"
            >
              <CheckCircle2 size={16} /> Concluir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReopenSelected}
              className="flex-1 gap-1.5 rounded-xl sm:flex-none"
            >
              <RotateCcw size={16} /> Reabrir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteSelected}
              className="flex-1 gap-1.5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
            >
              <Trash2 size={16} /> Excluir
            </Button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="hidden rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block ml-2"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
