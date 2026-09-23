import { AnimatePresence,motion } from 'framer-motion';
import { Plus, SlidersHorizontal, Sparkles } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { PRIORITY_CONFIG,TASK_CATEGORY_LABELS } from './constants';
import { analyzeTaskTitle } from './smartTaskCategory';

interface QuickAddTaskBarProps {
  onAddTask: (title: string, detectedCategory: number | null, detectedPriority: number | null) => Promise<void>;
  onOpenDetailedForm: (initialTitle?: string) => void;
  disabled?: boolean;
}

export function QuickAddTaskBar({
  onAddTask,
  onOpenDetailedForm,
  disabled = false,
}: QuickAddTaskBarProps) {
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const smartResult = analyzeTaskTitle(title);
  const showSmartBadge = smartResult.category !== null || smartResult.priority !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isAdding || disabled) return;

    setIsAdding(true);
    try {
      await onAddTask(smartResult.title || trimmed, smartResult.category, smartResult.priority);
      setTitle('');
      inputRef.current?.focus();
    } catch {
      // erro tratado no chamador
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative flex flex-col sm:flex-row sm:items-center rounded-2xl border bg-card p-1.5 shadow-subtle transition-all duration-200 gap-2 sm:gap-0',
        isFocused
          ? 'border-primary ring-2 ring-primary/20 shadow-card'
          : 'border-border/70 hover:border-border'
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Adicionar tarefa rápida (ex: Pagar conta de luz, Comprar ração...)"
        disabled={disabled || isAdding}
        maxLength={200}
        className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
      />

      <div className="flex items-center justify-between sm:justify-end gap-1.5 pr-1 px-2 sm:px-0">
        <AnimatePresence>
          {showSmartBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              className="flex items-center gap-1.5 mr-2"
            >
              {smartResult.category !== null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                  <Sparkles size={10} />
                  {TASK_CATEGORY_LABELS[smartResult.category]}
                </span>
              )}
              {smartResult.priority !== null && (
                <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold', PRIORITY_CONFIG[smartResult.priority as keyof typeof PRIORITY_CONFIG].pill)}>
                  {PRIORITY_CONFIG[smartResult.priority as keyof typeof PRIORITY_CONFIG].label}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          {/* Botão de abrir modal com mais detalhes (data, prioridade, responsável) */}
          <button
            type="button"
            onClick={() => onOpenDetailedForm(title)}
            disabled={disabled || isAdding}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            title="Abrir detalhes (data, prioridade, responsável)"
            aria-label="Abrir formulário detalhado"
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* Botão de Adição Rápida */}
          <button
            type="submit"
            disabled={!title.trim() || isAdding || disabled}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40"
            aria-label="Adicionar tarefa"
          >
            {isAdding ? <Spinner size="sm" /> : <Plus size={15} strokeWidth={2.5} />}
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </div>
    </form>
  );
}
