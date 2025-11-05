import { formatCurrency } from '@/utils/dashboardMetrics';
import {
  AlertCircle,
  Calendar,
  DollarSign,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import MetricCard from './MetricCard';

/**
 * Card: Economia do Mês
 */
export function SavingsCard({ savings, percentage, animationDelay = 0 }) {
  const isSaving = savings > 0;
  const Icon = isSaving ? TrendingDown : TrendingUp;
  const color = isSaving ? '#10b981' : '#ef4444'; // emerald ou red

  return (
    <MetricCard
      icon={Icon}
      title="Economia do Mês"
      value={formatCurrency(Math.abs(savings))}
      color={color}
      animationDelay={animationDelay}
      comparison={{
        value: percentage,
        label: 'vs mês anterior'
      }}
      alertType={!isSaving ? 'warning' : undefined}
      footer={
        <div className="text-xs text-gray-600 dark:text-dark-text-tertiary">
          {isSaving ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Você economizou este mês!
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400 font-semibold">
              ⚠ Gastos aumentaram
            </span>
          )}
        </div>
      }
    />
  );
}

/**
 * Card: Categoria com Mais Gastos
 */
export function TopCategoryCard({ category, value, animationDelay = 0 }) {
  return (
    <MetricCard
      icon={PieChart}
      title="Categoria Principal"
      value={category}
      color="#f59e0b" // amber-500
      animationDelay={animationDelay}
      footer={
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-gray-600 dark:text-dark-text-tertiary">
            <span>Total gasto:</span>
            <span className="font-semibold">{formatCurrency(value)}</span>
          </div>
          <div className="text-gray-600 dark:text-dark-text-tertiary">
            🏆 Categoria com mais despesas
          </div>
        </div>
      }
    />
  );
}

/**
 * Card: Dias até Próxima Conta
 */
export function NextBillCard({ days, bill, animationDelay = 0 }) {
  const isUrgent = days <= 3 && days > 0;
  const color = isUrgent ? '#ef4444' : '#06b6d4'; // red ou cyan

  return (
    <MetricCard
      icon={Calendar}
      title="Próxima Conta"
      value={days > 0 ? `${days} ${days === 1 ? 'dia' : 'dias'}` : 'Hoje'}
      color={color}
      animationDelay={animationDelay}
      alertType={isUrgent ? 'error' : undefined}
      footer={
        <div className="text-xs text-gray-600 dark:text-dark-text-tertiary">
          <span className="font-semibold">{bill}</span>
          {isUrgent && (
            <div className="mt-1 text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>Vence em breve!</span>
            </div>
          )}
        </div>
      }
    />
  );
}

/**
 * Card: Tarefas Vencidas
 */
export function OverdueTasksCard({ count, animationDelay = 0 }) {
  const hasOverdue = count > 0;
  const color = hasOverdue ? '#ef4444' : '#10b981'; // red ou emerald

  return (
    <MetricCard
      icon={AlertCircle}
      title="Tarefas Vencidas"
      value={count}
      color={color}
      animationDelay={animationDelay}
      alertType={hasOverdue ? 'error' : undefined}
      footer={
        <div className="text-xs text-gray-600 dark:text-dark-text-tertiary">
          {hasOverdue ? (
            <span className="text-red-600 dark:text-red-400 font-semibold">
              ⚠ {count} {count === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Nenhuma tarefa atrasada
            </span>
          )}
        </div>
      }
    />
  );
}

/**
 * Card: Média de Gastos Diários
 */
export function DailyAverageCard({ average, animationDelay = 0 }) {
  return (
    <MetricCard
      icon={DollarSign}
      title="Média Diária"
      value={formatCurrency(average)}
      color="#8b5cf6" // violet-500
      animationDelay={animationDelay}
      footer={
        <div className="text-xs text-gray-600 dark:text-dark-text-tertiary">
          📊 Gasto médio por dia no mês
        </div>
      }
    />
  );
}

/**
 * Card: Projeção de Gastos do Mês
 */
export function MonthProjectionCard({ projection, current, animationDelay = 0 }) {
  const percentageOfProjection = current > 0 
    ? Math.round((current / projection) * 100)
    : 0;

  return (
    <MetricCard
      icon={Target}
      title="Projeção do Mês"
      value={formatCurrency(projection)}
      color="#ec4899" // pink-500
      animationDelay={animationDelay}
      footer={
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Gasto atual:</span>
            <span className="font-semibold">{formatCurrency(current)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentageOfProjection, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {percentageOfProjection}% da projeção
          </div>
        </div>
      }
    />
  );
}
