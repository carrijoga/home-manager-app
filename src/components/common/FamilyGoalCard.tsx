import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export interface FamilyGoal {
  id: string;
  categoryLabel: string;
  title: string;
  /** 0–1 */
  progress: number;
  remainingLabel: string;
}

interface FamilyGoalCardProps {
  goals?: FamilyGoal[];
  className?: string;
}

/**
 * FamilyGoalCard — Metas da família.
 *
 * Design System "Domestic Sanctuary":
 * - bg-card (surface-container-low)
 * - text-secondary (gold) para o tema de conquista/prêmio
 * - Barra dourada com glow sutil
 * - Inner card bg-[var(--surface-container)]/30 (recuado)
 * - font-editorial headline, font-ui para dados
 */
export function FamilyGoalCard({ goals = [], className }: FamilyGoalCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (goals.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex > goals.length - 1) {
      setCurrentIndex(0);
    }
  }, [goals, currentIndex]);

  const hasGoals = goals.length > 0;
  const activeGoal = hasGoals ? goals[currentIndex] : null;

  const showPreviousGoal = () => {
    if (!hasGoals) return;
    setCurrentIndex((prev) => (prev - 1 + goals.length) % goals.length);
  };

  const showNextGoal = () => {
    if (!hasGoals) return;
    setCurrentIndex((prev) => (prev + 1) % goals.length);
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-8 pb-11 outline-none',
        className
      )}
    >
      {/* Section title */}
      <div className="flex shrink-0 items-center gap-3">
        <Trophy
          size={18}
          className="shrink-0 text-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h3 className="font-editorial whitespace-nowrap text-lg font-bold text-foreground">
          Metas da Família
        </h3>
      </div>

      {/* Goal content */}
      <div className="flex flex-1 flex-col">
        {!hasGoals ? (
          <p className="font-ui text-sm leading-relaxed text-muted-foreground/50">
            Sem metas definidas ainda.
          </p>
        ) : (
          <GoalItem goal={activeGoal!} />
        )}
      </div>

      {hasGoals && goals.length > 1 ? (
        <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
          <button
            type="button"
            onClick={showPreviousGoal}
            className="font-ui text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Anterior
          </button>
          <span className="font-ui text-xs text-muted-foreground">
            {currentIndex + 1} / {goals.length}
          </span>
          <button
            type="button"
            onClick={showNextGoal}
            className="font-ui text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}

function GoalItem({ goal }: { goal: FamilyGoal }) {
  const pct = Math.round(goal.progress * 100);

  return (
    <div className="flex cursor-pointer flex-col gap-4 py-5 transition-opacity hover:opacity-90">
      {/* Header row */}
      <div className="flex min-w-0 items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className="font-ui truncate font-semibold uppercase tracking-[1.2px] text-secondary"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            {goal.categoryLabel}
          </span>
          <span className="font-ui truncate text-2xl font-semibold text-foreground">
            {goal.title}
          </span>
        </div>
        <span className="font-ui shrink-0 text-[30px] font-semibold leading-9 text-secondary">
          {pct}%
        </span>
      </div>

      {/* Gold progress bar with glow */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="duration-[length:var(--dur-slow)] h-full rounded-full transition-all"
          style={{
            background: 'var(--secondary)',
            width: `${Math.min(100, pct)}%`,
            boxShadow: '0px 0px 15px 0px color-mix(in srgb, var(--secondary) 35%, transparent)',
          }}
        />
      </div>

      {/* Remaining label */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12 }} aria-hidden="true">
          ⏳
        </span>
        <span className="font-ui text-sm text-muted-foreground">{goal.remainingLabel}</span>
      </div>
    </div>
  );
}

export default FamilyGoalCard;
