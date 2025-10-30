import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { PriorityLevels } from '../../models/types';

/**
 * Módulo de Itens Futuros
 */
const FutureItems = ({ futureItems, onAddItem, onDeleteItem }) => {
  const [newItem, setNewItem] = useState({
    name: '',
    priority: 'média',
    estimatedCost: ''
  });

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      onAddItem({
        name: newItem.name,
        priority: newItem.priority,
        estimatedCost: newItem.estimatedCost
      });
      setNewItem({ name: '', priority: 'média', estimatedCost: '' });
    }
  };

  const priorityColors = {
    'alta': 'border-red-500 bg-red-50',
    'média': 'border-yellow-500 bg-yellow-50',
    'baixa': 'border-green-500 bg-green-50'
  };

  return (
    <div className="space-y-6">
      <Card title="Itens para Comprar no Futuro">
        {/* Formulário de Novo Item */}
        <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="Nome do item..."
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <Button variant="warning" fullWidth onClick={handleAddItem}>
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
                <h3 className="font-semibold text-gray-700 mb-2 capitalize">
                  Prioridade {priority}
                </h3>
                {itemsInPriority.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-l-4 mb-2 ${priorityColors[priority]}`}
                  >
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.estimatedCost}</p>
                    </div>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700"
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
};

export default FutureItems;
