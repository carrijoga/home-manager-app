import { Trash2 } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import MoneyInput from '../common/MoneyInput';

interface Expense {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
}

const ExpenseCategories = {
  FIXED: 'Fixo',
  MAINTENANCE: 'Manutenção',
  NEW_ITEM: 'Novo item',
  GENERAL: 'Geral',
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  HEALTH: 'Saúde',
  EDUCATION: 'Educação',
  ENTERTAINMENT: 'Entretenimento',
  OTHER: 'Outro',
} as const;

interface ExpenseFormData {
  description: string;
  value: number | null;
  date: string;
  category: string;
}

const Financial = memo(() => {
  const { expenses: rawExpenses, addExpense, deleteExpense } = useApp();
  const expenses = rawExpenses as Expense[];
  const { showSuccess, showError, showLoading, dismissToast } = useToastNotifications();

  const [newExpense, setNewExpense] = useState<ExpenseFormData>({
    description: '',
    value: null,
    date: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExpense = async () => {
    if (newExpense.description.trim() && newExpense.value !== null && newExpense.value > 0 && !isSubmitting) {
      setIsSubmitting(true);
      const loadingToast = showLoading('Processando gasto...');
      try {
        await addExpense({
          description: newExpense.description,
          value: newExpense.value,
          date: newExpense.date || new Date().toISOString().split('T')[0],
          category: newExpense.category || 'Geral',
        });
        dismissToast(loadingToast);
        setNewExpense({ description: '', value: null, date: '', category: '' });
        showSuccess('Gasto adicionado com sucesso!');
      } catch (error) {
        console.error('Erro ao adicionar gasto:', error);
        dismissToast(loadingToast);
        showError('Erro ao adicionar gasto. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      showSuccess('Gasto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
      showError('Erro ao excluir gasto. Tente novamente.');
    }
  };

  const totalByCategory = useMemo(() => {
    return expenses.reduce<Record<string, number>>((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.value;
      return acc;
    }, {});
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.value, 0);
  }, [expenses]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Card.jsx has no TS types — title prop inferred as null from default */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Card title={"Financeiro da Casa" as any}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-sage-400 to-sage-500 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Total de Gastos</p>
            <p className="text-[var(--text-3xl)] font-bold">R$ {totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-terracotta-400 to-terracotta-500 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Média Mensal</p>
            <p className="text-[var(--text-3xl)] font-bold">R$ {(totalExpenses / 1).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-honey-400 to-honey-500 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Categorias</p>
            <p className="text-[var(--text-3xl)] font-bold">{Object.keys(totalByCategory).length}</p>
          </div>
        </div>

        <div className="mb-6 space-y-3 p-4 bg-linen-100 dark:bg-muted rounded-xl border border-linen-300 dark:border-border">
          <Input
            placeholder="Descrição do gasto..."
            value={newExpense.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <MoneyInput
              value={newExpense.value}
              onChange={(v) => setNewExpense({ ...newExpense, value: v })}
              placeholder="Valor (R$)..."
            />
            <Input
              type="date"
              value={newExpense.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, date: e.target.value })}
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500 dark:focus:ring-terracotta-400 bg-background text-foreground"
            >
              <option value="">Categoria...</option>
              {Object.values(ExpenseCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Button variant="success" fullWidth onClick={handleAddExpense} loading={isSubmitting} disabled={isSubmitting}>
            Adicionar Gasto
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Gastos por Categoria</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(totalByCategory).map(([category, total]) => (
              <div key={category} className="bg-linen-100 dark:bg-muted p-3 rounded-lg border-l-4 border-honey-400 dark:border-honey-500">
                <p className="text-sm text-muted-foreground">{category}</p>
                <p className="text-xl font-bold text-foreground">R$ {(total as number).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground mb-3">Histórico de Gastos</h3>
          {sortedExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-linen-100 dark:hover:bg-muted transition-colors duration-[length:var(--dur-base)]">
              <div className="flex-1">
                <p className="text-foreground font-medium">{expense.description}</p>
                <p className="text-sm text-muted-foreground">
                  {expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-sage-600 dark:text-sage-400">R$ {expense.value.toFixed(2)}</span>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="text-terracotta-500 hover:text-terracotta-700 dark:text-terracotta-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

Financial.displayName = 'Financial';

export default Financial;
