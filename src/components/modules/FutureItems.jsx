import { useApp } from '@/contexts/AppContext';
import { Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { PriorityLevels } from '../../models/types';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

/**
 * Módulo de Itens Futuros
 */
const FutureItems = memo(() => {
  // Obtém estados e ações do contexto global
  const { futureItems, addFutureItem, deleteFutureItem } = useApp();
  
  const [newItem, setNewItem] = useState({
    name: '',
    priority: 'média',
    estimatedCost: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = async () => {
    if (newItem.name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await addFutureItem({
          name: newItem.name,
          priority: newItem.priority,
          estimatedCost: newItem.estimatedCost
        });
        setNewItem({ name: '', priority: 'média', estimatedCost: '' });
      } catch (error) {
        console.error('Erro ao adicionar item futuro:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const priorityColors = {
    'alta': 'border-rose-500 dark:border-rose-400 bg-rose-50 dark:bg-rose-900/20',
    'média': 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20',
    'baixa': 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
  };

  return (
    <div className="space-y-6">
      <Card title="Itens para Comprar no Futuro">
        {/* Formulário de Novo Item */}
        <div className="mb-6 space-y-3 p-4 bg-slate-50 dark:bg-dark-bg-secondary rounded-lg border border-slate-200 dark:border-dark-border-default">
          <Input
            placeholder="Nome do item..."
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
              className="p-2 border border-slate-300 dark:border-dark-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-dark-bg-secondary text-slate-900 dark:text-dark-text-primary"
            >
              <option value={PriorityLevels.HIGH}>Alta prioridade</option>
              <option value={PriorityLevels.MEDIUM}>Média prioridade</option>
              <option value={PriorityLevels.LOW}>Baixa prioridade</option>
            </select>
            <Input
              placeholder="Custo estimado..."
              value={newItem.estimatedCost}
              onChange={(e) => setNewItem({ ...newItem, estimatedCost: e.target.value })}
            />
          </div>
          <Button variant="warning" fullWidth onClick={handleAddItem} loading={isSubmitting} disabled={isSubmitting}>
            Adicionar Item
          </Button>
        </div>

        {/* Itens Agrupados por Prioridade */}
        <div className="space-y-3">
          {['alta', 'média', 'baixa'].map(priority => {
            const itemsInPriority = futureItems.filter(item => item.priority === priority);
            if (itemsInPriority.length === 0) return null;

            return (
              <div key={priority}>
                <h3 className="font-semibold text-slate-700 dark:text-dark-text-primary mb-2 capitalize">
                  Prioridade {priority}
                </h3>
                {itemsInPriority.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-l-4 mb-2 hover:opacity-90 transition-all duration-200 ${priorityColors[priority]}`}
                  >
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-dark-text-primary font-medium">{item.name}</p>
                      <p className="text-sm text-slate-600 dark:text-dark-text-secondary">{item.estimatedCost}</p>
                    </div>
                    <button
                      onClick={() => deleteFutureItem(item.id)}
                      className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
});

FutureItems.displayName = 'FutureItems';

export default FutureItems;
