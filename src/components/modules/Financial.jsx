import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ExpenseCategories } from '../../models/types';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

/**
 * Módulo Financeiro
 */
const Financial = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [newExpense, setNewExpense] = useState({
    description: '',
    value: '',
    date: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExpense = async () => {
    if (newExpense.description.trim() && newExpense.value && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddExpense({
          description: newExpense.description,
          value: parseFloat(newExpense.value),
          date: newExpense.date || new Date().toISOString().split('T')[0],
          category: newExpense.category || 'Geral'
        });
        setNewExpense({ description: '', value: '', date: '', category: '' });
      } catch (error) {
        console.error('Erro ao adicionar gasto:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Calcula estatísticas
  const totalByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.value;
    return acc;
  }, {});

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <Card title="Financeiro da Casa">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-4">
            <p className="text-sm opacity-90">Total de Gastos</p>
            <p className="text-3xl font-bold">R$ {totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-4">
            <p className="text-sm opacity-90">Média Mensal</p>
            <p className="text-3xl font-bold">R$ {(totalExpenses / 1).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <p className="text-sm opacity-90">Categorias</p>
            <p className="text-3xl font-bold">{Object.keys(totalByCategory).length}</p>
          </div>
        </div>

        {/* Formulário de Novo Gasto */}
        <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="Descrição do gasto..."
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              type="number"
              placeholder="Valor (R$)..."
              value={newExpense.value}
              onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
            />
            <Input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Categoria...</option>
              {Object.values(ExpenseCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Button variant="success" fullWidth onClick={handleAddExpense} loading={isSubmitting} disabled={isSubmitting}>
            Adicionar Gasto
          </Button>
        </div>

        {/* Gastos por Categoria */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Gastos por Categoria</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(totalByCategory).map(([category, total]) => (
              <div key={category} className="bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-500">
                <p className="text-sm text-gray-600">{category}</p>
                <p className="text-xl font-bold text-gray-800">R$ {total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico de Gastos */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 mb-3">Histórico de Gastos</h3>
          {sortedExpenses.map(expense => (
            <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{expense.description}</p>
                <p className="text-sm text-gray-600">
                  {expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-emerald-600">R$ {expense.value.toFixed(2)}</span>
                <button
                  onClick={() => onDeleteExpense(expense.id)}
                  className="text-red-500 hover:text-red-700"
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
};

export default Financial;
