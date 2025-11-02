import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * Módulo de Lista de Compras
 */
const ShoppingList = ({ shoppingList, onAddItem, onToggleItem, onDeleteItem }) => {
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = async () => {
    if (newItem.name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddItem({
          name: newItem.name,
          quantity: newItem.quantity,
          category: newItem.category || 'Geral'
        });
        setNewItem({ name: '', quantity: '', category: '' });
      } catch (error) {
        console.error('Erro ao adicionar item:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Agrupa itens por categoria
  const groupedItems = shoppingList.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card
        title="Lista de Compras"
        subtitle={shoppingList.month}
      >
        {/* Formulário de Novo Item */}
        <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-3">
            <Input
              placeholder="Item..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="col-span-2"
            />
            <Input
              placeholder="Qtd..."
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
          </div>
          <Input
            placeholder="Categoria..."
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          />
          <Button variant="purple" fullWidth onClick={handleAddItem} loading={isSubmitting} disabled={isSubmitting}>
            Adicionar Item
          </Button>
        </div>

        {/* Itens Agrupados por Categoria */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 text-lg">{category}</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.checked ? 'bg-natureza-50 opacity-60' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleItem(item.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div>
                      <span className={`text-gray-800 ${item.checked ? 'line-through' : ''}`}>
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">({item.quantity})</span>
                    </div>
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
          </div>
        ))}
      </Card>
    </div>
  );
};

export default ShoppingList;
