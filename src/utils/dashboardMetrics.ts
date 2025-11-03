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

/**
 * Calcula economia do mês (comparado ao mês anterior)
 * @param expenses - Array de despesas
 * @returns Objeto com economia e percentual
 */
export function calculateMonthlySavings(expenses: any[]): { savings: number; percentage: number } {
    const currentMonth = getCurrentMonth();
    const previousMonth = getPreviousMonth();

    const expensesByMonth = groupExpensesByMonth(expenses);
    const currentExpenses = expensesByMonth[currentMonth] || 0;
    const previousExpenses = expensesByMonth[previousMonth] || 0;

    const savings = previousExpenses - currentExpenses;
    const percentage = previousExpenses > 0
        ? Math.round((savings / previousExpenses) * 100)
        : 0;

    return { savings, percentage };
}

/**
 * Identifica categoria com mais gastos no mês
 * @param expenses - Array de despesas
 * @returns Objeto com categoria e valor
 */
export function getTopExpenseCategory(expenses: any[]): { category: string; value: number } {
    const currentMonth = getCurrentMonth();
    const currentExpenses = expenses.filter(e => e.date.substring(0, 7) === currentMonth);

    const categoryTotals: Record<string, number> = {};
    currentExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.value;
    });

    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) {
        return { category: 'Nenhuma', value: 0 };
    }

    const [topCategory, topValue] = entries.reduce((max, current) =>
        current[1] > max[1] ? current : max
    );

    return { category: topCategory, value: topValue };
}

/**
 * Calcula dias até próxima conta vencer
 * @param expenses - Array de despesas
 * @returns Objeto com dias e descrição da conta
 */
export function getDaysUntilNextBill(expenses: any[]): { days: number; bill: string } {
    const today = new Date();
    const currentMonth = getCurrentMonth();

    // Contas fixas típicas que vencem no mês
    const fixedExpenses = expenses.filter(e =>
        e.category === 'Fixo' && e.date.substring(0, 7) === currentMonth
    );

    if (fixedExpenses.length === 0) {
        return { days: 0, bill: 'Nenhuma conta' };
    }

    // Encontra próxima conta a vencer
    const upcomingBills = fixedExpenses
        .map(e => ({
            ...e,
            dueDate: new Date(e.date)
        }))
        .filter(e => e.dueDate >= today)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    if (upcomingBills.length === 0) {
        return { days: 0, bill: 'Nenhuma conta pendente' };
    }

    const nextBill = upcomingBills[0];
    const diffTime = nextBill.dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { days: diffDays, bill: nextBill.description };
}

/**
 * Conta tarefas vencidas (overdue)
 * @param tasks - Array de tarefas
 * @returns Número de tarefas vencidas
 */
export function getOverdueTasks(tasks: any[]): number {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => !t.completed && t.dueDate < today).length;
}

/**
 * Calcula média de gastos diários do mês
 * @param expenses - Array de despesas
 * @returns Média de gastos diários
 */
export function getDailyAverageExpense(expenses: any[]): number {
    const currentMonth = getCurrentMonth();
    const currentExpenses = expenses.filter(e => e.date.substring(0, 7) === currentMonth);

    if (currentExpenses.length === 0) return 0;

    const total = currentExpenses.reduce((sum, e) => sum + e.value, 0);
    const today = new Date();
    const daysInMonth = today.getDate(); // Dias decorridos no mês

    return daysInMonth > 0 ? total / daysInMonth : 0;
}

/**
 * Projeta gastos totais do mês com base na média diária
 * @param expenses - Array de despesas
 * @returns Projeção de gastos do mês
 */
export function getMonthlyExpenseProjection(expenses: any[]): number {
    const dailyAverage = getDailyAverageExpense(expenses);
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return dailyAverage * daysInMonth;
}
