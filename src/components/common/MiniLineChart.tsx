import { useTheme } from "@/contexts/ThemeContext";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface DataPoint {
  value: number;
}

interface MiniLineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

/**
 * Mini gráfico de linha para tendências
 * Usado nos cards de métricas do Dashboard
 */
const MiniLineChart = ({
  data,
  color = "#6366f1", // indigo-500 por padrão
  height = 40,
}: MiniLineChartProps) => {
  const { theme } = useTheme();

  // Se não há dados suficientes, mostra linha plana
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-gray-400 dark:text-dark-text-tertiary"
        style={{ height }}
      >
        Sem dados
      </div>
    );
  }

  // Ajusta a cor para modo escuro
  const lineColor = theme === "dark" ? adjustColorForDarkMode(color) : color;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Ajusta a cor para melhor visibilidade no modo escuro
 */
function adjustColorForDarkMode(color: string): string {
  const colorMap: { [key: string]: string } = {
    "#6366f1": "#818cf8", // indigo-500 → indigo-400
    "#10b981": "#34d399", // emerald-500 → emerald-400
    "#06b6d4": "#22d3ee", // cyan-500 → cyan-400
    "#a855f7": "#c084fc", // purple-500 → purple-400
    "#f59e0b": "#fbbf24", // amber-500 → amber-400
    "#ef4444": "#f87171", // red-500 → red-400
  };

  return colorMap[color.toLowerCase()] || color;
}

export default MiniLineChart;
