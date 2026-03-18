import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { ReactNode } from "react";
import MiniLineChart from "./MiniLineChart";

interface DataPoint {
  value: number;
}

export type MetricTone = 'terracotta' | 'honey' | 'sage' | 'sky' | 'blush';

export interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  /** Semantic color tone */
  tone?: MetricTone;
  /** @deprecated Use tone instead. Kept for backward compat during migration. */
  color?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Dados para o mini gráfico de tendência */
  chartData?: DataPoint[];
  /** Comparação com período anterior (% ou valor) */
  comparison?: {
    value: number;
    label?: string;
  };
  /** Conteúdo adicional no rodapé do card */
  footer?: ReactNode;
  /** Tipo de alerta (visual apenas) */
  alertType?: "success" | "warning" | "danger" | "info";
  /** Delay para animação de entrada */
  animationDelay?: number;
}

const TONE_MAP: Record<MetricTone, { iconBg: string; iconColor: string; valueColor: string; chartHex: string; cardBg: string; borderColor: string }> = {
  terracotta: {
    iconBg:      'bg-terracotta-100 dark:bg-terracotta-900/30',
    iconColor:   'text-terracotta-600 dark:text-terracotta-400',
    valueColor:  'text-terracotta-600 dark:text-terracotta-400',
    chartHex:    '#c1714d',
    cardBg:      'bg-terracotta-50/60 dark:bg-terracotta-900/10',
    borderColor: 'border-terracotta-200/70 dark:border-terracotta-800/40',
  },
  honey: {
    iconBg:      'bg-honey-100 dark:bg-honey-900/30',
    iconColor:   'text-honey-600 dark:text-honey-400',
    valueColor:  'text-honey-600 dark:text-honey-400',
    chartHex:    '#e5a520',
    cardBg:      'bg-honey-50/60 dark:bg-honey-900/10',
    borderColor: 'border-honey-200/70 dark:border-honey-800/40',
  },
  sage: {
    iconBg:      'bg-sage-100 dark:bg-sage-900/30',
    iconColor:   'text-sage-500 dark:text-sage-400',
    valueColor:  'text-sage-600 dark:text-sage-400',
    chartHex:    '#4a8a61',
    cardBg:      'bg-sage-50/50 dark:bg-sage-900/10',
    borderColor: 'border-sage-200/60 dark:border-sage-800/40',
  },
  sky: {
    iconBg:      'bg-linen-200 dark:bg-linen-900/30',
    iconColor:   'text-honey-600 dark:text-honey-400',
    valueColor:  'text-honey-600 dark:text-honey-400',
    chartHex:    '#e5a520',
    cardBg:      'bg-linen-100/60 dark:bg-linen-900/10',
    borderColor: 'border-linen-300/70 dark:border-linen-800/40',
  },
  blush: {
    iconBg:      'bg-terracotta-50 dark:bg-terracotta-900/20',
    iconColor:   'text-terracotta-400 dark:text-terracotta-300',
    valueColor:  'text-terracotta-500 dark:text-terracotta-300',
    chartHex:    '#eca487',
    cardBg:      'bg-terracotta-50/40 dark:bg-terracotta-900/10',
    borderColor: 'border-terracotta-100/70 dark:border-terracotta-800/30',
  },
};

/**
 * Card de métrica com comparação, mini gráfico e indicadores visuais
 * Componente reutilizável para o Dashboard
 */
const MetricCard = ({
  icon: Icon,
  title,
  value,
  tone,
  color,        // legacy fallback
  className,
  chartData,
  comparison,
  footer,
  alertType,
  animationDelay = 0,
}: MetricCardProps) => {
  const isPositive = comparison && comparison.value > 0;
  const isNegative = comparison && comparison.value < 0;
  const comparisonLabel = comparison?.label || "vs mês anterior";

  // Resolve tone or fall back to legacy color prop
  const effectiveTone = tone ?? (color ? null : 'terracotta');
  const toneStyles = effectiveTone ? TONE_MAP[effectiveTone] : null;

  // alertType → top accent strip class
  const alertStripClass: Record<string, string> = {
    success: 'bg-sage-400',
    warning: 'bg-honey-400',
    danger:  'bg-terracotta-500',
    info:    'bg-sky-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "text-card-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border",
        "h-full flex flex-col",
        toneStyles ? toneStyles.cardBg : 'bg-card',
        toneStyles ? toneStyles.borderColor : 'border-border',
        className
      )}
    >
      {/* Top accent strip (replaces left border) */}
      {alertType && (
        <div className={cn("h-1 w-full shrink-0", alertStripClass[alertType])} />
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Icon + Title */}
        <div className="flex items-center space-x-3 mb-4">
          <div
            className={cn("p-2 rounded-lg", toneStyles?.iconBg)}
            style={!toneStyles ? { backgroundColor: `${color}20`, color } : undefined}
          >
            {toneStyles ? (
              <Icon size={24} className={toneStyles.iconColor} />
            ) : (
              <Icon size={24} />
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>

        {/* Main Value */}
        <motion.div
          key={String(value)}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={cn("text-[var(--text-2xl)] font-bold mb-2", toneStyles?.valueColor)}
          style={!toneStyles ? { color } : undefined}
        >
          {value}
        </motion.div>

        {/* Comparison */}
        {comparison !== undefined && (
          <div className="flex items-center space-x-1 mb-3">
            {isPositive && (
              <>
                <TrendingUp size={16} className="text-sage-400" />
                <span className="text-sm font-medium text-sage-600 dark:text-sage-400">+{comparison.value}%</span>
              </>
            )}
            {isNegative && (
              <>
                <TrendingDown size={16} className="text-terracotta-500" />
                <span className="text-sm font-medium text-terracotta-600 dark:text-terracotta-400">{comparison.value}%</span>
              </>
            )}
            {!isPositive && !isNegative && (
              <span className="text-sm font-medium text-muted-foreground">0%</span>
            )}
            <span className="text-xs text-muted-foreground ml-1">{comparisonLabel}</span>
          </div>
        )}

        {/* Mini Chart */}
        {chartData && chartData.length > 0 && (
          <div className="mb-3">
            <MiniLineChart data={chartData} color={toneStyles?.chartHex ?? color ?? '#c1714d'} height={50} />
          </div>
        )}

        <div className="flex-1" />

        {footer && (
          <div className="pt-3 border-t border-border mt-auto">{footer}</div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
