import { Trash2 } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { Input } from '../ui';

/**
 * Módulo de Lista de Compras
 */
const ShoppingList = memo(({ shoppingList, onAddItem, onToggleItem, onDeleteItem }) => {
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

  // Agrupa itens por categoria com useMemo para otimização
  const groupedItems = useMemo(() => {
    return shoppingList.items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [shoppingList.items]);

  return (
    <div className="space-y-6">
      <Card
        title="Lista de Compras"
        subtitle={shoppingList.month}
      >
        {/* Formulário de Novo Item */}
        <div className="mb-6 space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
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
            <h3 className="font-semibold text-slate-700 dark:text-dark-text-primary mb-3 text-lg">{category}</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
                    item.checked 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 opacity-60' 
                      : 'bg-slate-50 dark:bg-dark-bg-secondary border-slate-200 dark:border-dark-border-default hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleItem(item.id)}
                      className="w-5 h-5 cursor-pointer accent-emerald-500 dark:accent-emerald-400"
                    />
                    <div>
                      <span className={`text-slate-800 dark:text-dark-text-primary ${item.checked ? 'line-through' : ''}`}>
                        {item.name}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-dark-text-secondary ml-2">({item.quantity})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
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
});

ShoppingList.displayName = 'ShoppingList';

export default ShoppingList;
