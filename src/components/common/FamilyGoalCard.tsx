import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

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
    <div className={cn(
      "flex flex-col gap-6 rounded-3xl h-full bg-card border border-border outline-none p-8 pb-11", 
      className
      )}
    >
      {/* Section title */}
      <div className="flex items-center gap-3 shrink-0">
        <Trophy size={18} className="text-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="font-editorial font-bold text-foreground text-lg whitespace-nowrap">
          Metas da Família
        </h3>
      </div>

      {/* Goal content */}
      <div className="flex flex-col flex-1">
        {!hasGoals ? (
          <p className="font-ui text-sm text-muted-foreground/50 leading-relaxed">
            Sem metas definidas ainda.
          </p>
        ) : (
          <GoalItem goal={activeGoal!} />
        )}
      </div>

      {hasGoals && goals.length > 1 ? (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={showPreviousGoal}
            className="font-ui text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Anterior
          </button>
          <span className="font-ui text-xs text-muted-foreground">
            {currentIndex + 1} / {goals.length}
          </span>
          <button
            type="button"
            onClick={showNextGoal}
            className="font-ui text-xs text-muted-foreground hover:text-foreground transition-colors"
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
    <div
      className="flex flex-col gap-4 py-5 cursor-pointer transition-opacity hover:opacity-90"
    >
      {/* Header row */}
      <div className="flex items-end justify-between gap-3 min-w-0">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span
            className="font-ui font-semibold uppercase text-secondary tracking-[1.2px] truncate"
            style={{ fontSize: "var(--text-xs)" }}
          >
            {goal.categoryLabel}
          </span>
          <span className="font-ui font-semibold text-foreground text-2xl truncate">
            {goal.title}
          </span>
        </div>
        <span className="font-ui font-semibold text-secondary shrink-0 text-[30px] leading-9">
          {pct}%
        </span>
      </div>

      {/* Gold progress bar with glow */}
      <div className="w-full h-3 rounded-full overflow-hidden bg-muted">
        <div
          className="h-full rounded-full transition-all duration-[length:var(--dur-slow)]"
          style={{
            background: "var(--secondary)",
            width: `${Math.min(100, pct)}%`,
            boxShadow: "0px 0px 15px 0px color-mix(in srgb, var(--secondary) 35%, transparent)",
          }}
        />
      </div>

      {/* Remaining label */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12 }} aria-hidden="true">⏳</span>
        <span className="font-ui text-sm text-muted-foreground">
          {goal.remainingLabel}
        </span>
      </div>
    </div>
  );
}

export default FamilyGoalCard;
