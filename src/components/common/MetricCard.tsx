import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { ReactNode } from "react";
import MiniLineChart from "./MiniLineChart";

interface DataPoint {
  value: number;
}

export interface MetricCardProps {
  /** Ícone da métrica (componente Lucide) */
  icon: LucideIcon;
  /** Título/nome da métrica */
  title: string;
  /** Valor principal a ser exibido */
  value: string | number;
  /** Cor do tema (hex ou classe tailwind) */
  color?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Dados para o mini gráfico de tendência */
  chartData?: DataPoint[];
  /** Comparação com período anterior (% ou valor) */
  comparison?: {
    value: number; // Percentual de mudança (ex: 15 para +15%, -10 para -10%)
    label?: string; // Label customizado (padrão: "vs mês anterior")
  };
  /** Conteúdo adicional no rodapé do card */
  footer?: ReactNode;
  /** Tipo de alerta (visual apenas) */
  alertType?: "success" | "warning" | "danger" | "info";
  /** Delay para animação de entrada */
  animationDelay?: number;
}

/**
 * Card de métrica com comparação, mini gráfico e indicadores visuais
 * Componente reutilizável para o Dashboard
 */
const MetricCard = ({
  icon: Icon,
  title,
  value,
  color = "#6366f1", // indigo-500 padrão
  className,
  chartData,
  comparison,
  footer,
  alertType,
  animationDelay = 0,
}: MetricCardProps) => {
  // Determina se a comparação é positiva ou negativa
  const isPositive = comparison && comparison.value > 0;
  const isNegative = comparison && comparison.value < 0;
  const comparisonLabel = comparison?.label || "vs mês anterior";

  // Classes de borda baseadas no tipo de alerta
  const alertBorderClass = {
    success: "border-l-4 border-emerald-500 dark:border-emerald-400",
    warning: "border-l-4 border-amber-500 dark:border-amber-400",
    danger: "border-l-4 border-red-500 dark:border-red-400",
    info: "border-l-4 border-cyan-500 dark:border-cyan-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.4 }}
      className={cn(
        "bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-5",
        "h-full flex flex-col",
        alertType && alertBorderClass[alertType],
        className
      )}
    >
      {/* Header: Ícone + Título */}
      <div className="flex items-center space-x-3 mb-4">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          <Icon size={24} />
        </div>
        <h3 className="text-sm font-medium text-slate-600 dark:text-dark-text-secondary">
          {title}
        </h3>
      </div>

      {/* Valor Principal */}
      <motion.div
        key={value}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold mb-2"
        style={{ color }}
      >
        {value}
      </motion.div>

      {/* Comparação com período anterior */}
      {comparison !== undefined && (
        <div className="flex items-center space-x-1 mb-3">
          {isPositive && (
            <>
              <TrendingUp
                size={16}
                className="text-emerald-500 dark:text-emerald-400"
              />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                +{comparison.value}%
              </span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown
                size={16}
                className="text-red-500 dark:text-red-400"
              />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {comparison.value}%
              </span>
            </>
          )}
          {!isPositive && !isNegative && (
            <span className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary">
              0%
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-dark-text-tertiary ml-1">
            {comparisonLabel}
          </span>
        </div>
      )}

      {/* Mini Gráfico */}
      {chartData && chartData.length > 0 && (
        <div className="mb-3">
          <MiniLineChart data={chartData} color={color} height={50} />
        </div>
      )}

      {/* Spacer para empurrar o footer para baixo */}
      <div className="flex-1" />

      {/* Footer customizado */}
      {footer && (
        <div className="pt-3 border-t border-gray-100 dark:border-dark-border-primary mt-auto">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
