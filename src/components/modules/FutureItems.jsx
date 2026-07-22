import { Trash2 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import * as futureItemsService from '@/services/futureItemsService';
import { PriorityLevels } from '@/types';

import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

/**
 * Módulo de Itens Futuros
 */
const FutureItems = memo(() => {
  const { showSuccess, showError } = useToastNotifications();

  const [futureItems, setFutureItems] = useState([]);

  useEffect(() => {
    let isMounted = true;
    futureItemsService.getAllFutureItems()
      .then(data => { if (isMounted) setFutureItems(data); })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const addFutureItem = async (item) => {
    const newItem = await futureItemsService.addFutureItem(item);
    setFutureItems(prev => [...prev, newItem]);
  };

  const deleteFutureItem = async (id) => {
    await futureItemsService.deleteFutureItem(id);
    setFutureItems(prev => prev.filter(i => i.id !== id));
  };

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
        showSuccess('Item adicionado à lista futura!');
      } catch (error) {
        console.error('Erro ao adicionar item futuro:', error);
        showError('Erro ao adicionar item. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteFutureItem(itemId);
      showSuccess('Item removido da lista!');
    } catch (error) {
      console.error('Erro ao remover item futuro:', error);
      showError('Erro ao remover item. Tente novamente.');
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
        <div className="mb-6 space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
          <Input
            placeholder="Nome do item..."
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={newItem.priority}
              onValueChange={(v) => setNewItem({ ...newItem, priority: v })}
            >
              <SelectTrigger id="future-priority" className="bg-muted/30 border-border/40">
                <SelectValue placeholder="Selecionar…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PriorityLevels.HIGH}>Alta prioridade</SelectItem>
                <SelectItem value={PriorityLevels.MEDIUM}>Média prioridade</SelectItem>
                <SelectItem value={PriorityLevels.LOW}>Baixa prioridade</SelectItem>
              </SelectContent>
            </Select>
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
                <h3 className="font-semibold text-foreground mb-2 capitalize">
                  Prioridade {priority}
                </h3>
                {itemsInPriority.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-l-4 mb-2 hover:opacity-90 transition-all duration-200 ${priorityColors[priority]}`}
                  >
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.estimatedCost}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
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
