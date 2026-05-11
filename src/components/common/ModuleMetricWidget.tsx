import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FooterItem {
  label: string;
  value: string;
  valueColor?: string;
}

interface ModuleMetricWidgetProps {
  icon: ReactNode;
  iconColor: string;
  category: string;
  label: string;
  value: string;
  /** Up to 2 footer stat pairs */
  footer?: [FooterItem, FooterItem?];
  /** Progress bar fill 0–1 */
  progress?: number;
  progressColor?: string;
  progressLabel?: string;
  progressLabelColor?: string;
  extra?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * ModuleMetricWidget — Card de métrica de módulo.
 *
 * Design System "Domestic Sanctuary":
 * - bg-card (surface-container-low) sobre bg-background (surface)
 * - border-border ghost border — sem linhas divisórias internas
 * - font-ui para labels e valores
 * - rounded-3xl (xl rounding)
 * - Tonal depth via background shift, nunca boxShadow pesado
 */
export function ModuleMetricWidget({
  icon,
  iconColor,
  category,
  label,
  value,
  footer,
  progress,
  progressColor = "var(--chart-2)",
  progressLabel,
  progressLabelColor,
  extra,
  className,
  onClick,
}: ModuleMetricWidgetProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "flex flex-col justify-between p-6 rounded-3xl h-full gap-6 bg-card border border-border outline-none",
        onClick && "cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all duration-[length:var(--dur-base)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {/* Icon + category label */}
      <div className="flex items-center justify-between w-full">
        <div style={{ color: iconColor }}>{icon}</div>
        <span
          className="font-ui font-semibold uppercase text-muted-foreground/80 tracking-[1px]"
          style={{ fontSize: "var(--text-xs)" }}
        >
          {category}
        </span>
      </div>

      {/* Main value */}
      <div className="flex flex-col gap-0.5 w-full">
        <p className="font-ui text-muted-foreground" style={{ fontSize: "var(--text-xs)" }}>
          {label}
        </p>
        <p className="font-ui font-semibold text-foreground text-2xl leading-tight truncate">
          {value}
        </p>
      </div>

      {/* Footer stats */}
      {footer && (
        <div className="flex items-end justify-between w-full">
          {footer.map((item, i) =>
            item ? (
              <div key={i} className="flex flex-col gap-1 min-w-0">
                <span
                  className="font-ui uppercase text-muted-foreground/80 truncate"
                  style={{ fontSize: "var(--text-xs)", textAlign: i === 1 ? "right" : "left" }}
                >
                  {item.label}
                </span>
                <span
                  className="font-ui font-semibold text-sm truncate"
                  style={{
                    color: item.valueColor ?? "var(--foreground)",
                    textAlign: i === 1 ? "right" : "left",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="flex items-center gap-2 w-full">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted"
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
              style={{ background: progressColor }}
            />
          </div>
          {progressLabel && (
            <span
              className="font-ui font-semibold shrink-0"
              style={{
                fontSize: "var(--text-xs)",
                color: progressLabelColor ?? progressColor,
              }}
            >
              {progressLabel}
            </span>
          )}
        </div>
      )}

      {extra}
    </div>
  );
}

export default ModuleMetricWidget;
