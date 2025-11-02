/**
 * Utilitários para cálculos de métricas do Dashboard
 */

/**
 * Calcula o percentual de mudança entre dois valores
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @returns Percentual de mudança (positivo ou negativo)
 */
export function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }

    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10; // Arredonda para 1 casa decimal
}

/**
 * Obtém os últimos N meses em formato 'YYYY-MM'
 * @param count - Quantidade de meses
 * @returns Array de strings no formato 'YYYY-MM'
 */
export function getLastNMonths(count: number): string[] {
    const months: string[] = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        months.push(`${year}-${month}`);
    }

    return months;
}

/**
 * Obtém o mês atual em formato 'YYYY-MM'
 */
export function getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Obtém o mês anterior em formato 'YYYY-MM'
 */
export function getPreviousMonth(): string {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Agrupa despesas por mês e calcula totais
 * @param expenses - Array de despesas
 * @returns Objeto com totais por mês { 'YYYY-MM': total }
 */
export function groupExpensesByMonth(expenses: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    expenses.forEach(expense => {
        const month = expense.date.substring(0, 7); // Extrai 'YYYY-MM' de 'YYYY-MM-DD'
        grouped[month] = (grouped[month] || 0) + expense.value;
    });

    return grouped;
}

/**
 * Agrupa tarefas por mês e calcula estatísticas
 * @param tasks - Array de tarefas
 * @returns Objeto com estatísticas por mês
 */
export function groupTasksByMonth(tasks: any[]): Record<string, { total: number; completed: number; completionRate: number }> {
    const grouped: Record<string, { total: number; completed: number; completionRate: number }> = {};

    tasks.forEach(task => {
        const month = task.dueDate.substring(0, 7); // Extrai 'YYYY-MM' de 'YYYY-MM-DD'

        if (!grouped[month]) {
            grouped[month] = { total: 0, completed: 0, completionRate: 0 };
        }

        grouped[month].total++;
        if (task.completed) {
            grouped[month].completed++;
        }
    });

    // Calcula taxa de conclusão
    Object.keys(grouped).forEach(month => {
        const stats = grouped[month];
        stats.completionRate = stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;
    });

    return grouped;
}

/**
 * Gera dados de tendência para os últimos N meses
 * @param monthlyData - Dados agrupados por mês
 * @param count - Quantidade de meses (padrão: 6)
 * @returns Array de DataPoints para o gráfico
 */
export function generateTrendData(monthlyData: Record<string, number>, count: number = 6): Array<{ value: number }> {
    const months = getLastNMonths(count);

    return months.map(month => ({
        value: monthlyData[month] || 0
    }));
}

/**
 * Calcula a média de um array de números
 * @param values - Array de valores
 * @returns Média dos valores
 */
export function calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

/**
 * Formata valor monetário para exibição
 * @param value - Valor numérico
 * @param showCurrency - Se deve mostrar o símbolo R$
 * @returns String formatada
 */
export function formatCurrency(value: number, showCurrency: boolean = true): string {
    const formatted = value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return showCurrency ? `R$ ${formatted}` : formatted;
}

/**
 * Filtra itens por mês específico
 * @param items - Array de itens com propriedade date ou monthYear
 * @param month - Mês no formato 'YYYY-MM'
 * @returns Array filtrado
 */
export function filterItemsByMonth(items: any[], month: string): any[] {
    return items.filter(item => {
        const itemMonth = item.monthYear || item.date?.substring(0, 7);
        return itemMonth === month;
    });
}
