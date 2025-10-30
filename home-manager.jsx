import React, { useState } from 'react';
import { Home, CheckSquare, ShoppingCart, DollarSign, Package, Calendar, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const HomeManagerApp = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [notices, setNotices] = useState([
    { id: 1, text: 'Lembrete: Reunião de condomínio sexta-feira às 19h', author: 'João', date: '2025-10-28' },
    { id: 2, text: 'Encanador virá terça-feira para verificar o chuveiro', author: 'Maria', date: '2025-10-29' }
  ]);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Limpar a geladeira', assignedTo: 'Maria', completed: false, dueDate: '2025-11-02' },
    { id: 2, title: 'Levar o lixo para fora', assignedTo: 'João', completed: false, dueDate: '2025-10-30' },
    { id: 3, title: 'Pagar conta de luz', assignedTo: 'Geral', completed: true, dueDate: '2025-10-28' }
  ]);
  const [shoppingList, setShoppingList] = useState({
    month: 'Outubro 2025',
    items: [
      { id: 1, name: 'Arroz', quantity: '5kg', checked: false, category: 'Alimentos' },
      { id: 2, name: 'Feijão', quantity: '2kg', checked: false, category: 'Alimentos' },
      { id: 3, name: 'Detergente', quantity: '3un', checked: true, category: 'Limpeza' }
    ]
  });
  const [futureItems, setFutureItems] = useState([
    { id: 1, name: 'Sofá novo', priority: 'média', estimatedCost: 'R$ 2.500' },
    { id: 2, name: 'Aspirador de pó', priority: 'alta', estimatedCost: 'R$ 800' }
  ]);
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Conserto do chuveiro', value: 150, date: '2025-10-25', category: 'Manutenção' },
    { id: 2, description: 'Micro-ondas novo', value: 450, date: '2025-10-20', category: 'Novo item' },
    { id: 3, description: 'Aluguel', value: 1500, date: '2025-10-05', category: 'Fixo' }
  ]);

  const [newNotice, setNewNotice] = useState('');
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', dueDate: '' });
  const [newShoppingItem, setNewShoppingItem] = useState({ name: '', quantity: '', category: '' });
  const [newFutureItem, setNewFutureItem] = useState({ name: '', priority: 'média', estimatedCost: '' });
  const [newExpense, setNewExpense] = useState({ description: '', value: '', date: '', category: '' });

  // Dashboard Module
  const renderDashboard = () => {
    const myTasks = tasks.filter(t => !t.completed).slice(0, 3);
    const recentExpenses = expenses.slice(0, 3);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Quadro de Avisos</h2>
            <button className="text-blue-600 hover:text-blue-700">
              <Plus size={24} />
            </button>
          </div>
          <div className="space-y-3">
            {notices.map(notice => (
              <div key={notice.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-gray-800">{notice.text}</p>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  <span>Por: {notice.author}</span>
                  <span>{new Date(notice.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Adicionar novo aviso..."
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              className="w-full p-2 border rounded-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newNotice.trim()) {
                  setNotices([...notices, {
                    id: Date.now(),
                    text: newNotice,
                    author: 'Você',
                    date: new Date().toISOString().split('T')[0]
                  }]);
                  setNewNotice('');
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tarefas Pendentes</h3>
            <div className="text-3xl font-bold text-blue-600">{tasks.filter(t => !t.completed).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Gastos do Mês</h3>
            <div className="text-3xl font-bold text-green-600">R$ {totalExpenses.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Itens na Lista</h3>
            <div className="text-3xl font-bold text-purple-600">{shoppingList.items.filter(i => !i.checked).length}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Minhas Tarefas</h3>
          <div className="space-y-2">
            {myTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-gray-800">{task.title}</span>
                </div>
                <span className="text-sm text-gray-600">{task.assignedTo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Tasks Module
  const renderTasks = () => {
    const handleToggleTask = (id) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    };

    const handleAddTask = () => {
      if (newTask.title.trim()) {
        setTasks([...tasks, {
          id: Date.now(),
          title: newTask.title,
          assignedTo: newTask.assignedTo || 'Geral',
          completed: false,
          dueDate: newTask.dueDate || new Date().toISOString().split('T')[0]
        }]);
        setNewTask({ title: '', assignedTo: '', dueDate: '' });
      }
    };

    const handleDeleteTask = (id) => {
      setTasks(tasks.filter(task => task.id !== id));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tarefas da Casa</h2>
          
          <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Nome da tarefa..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Responsável..."
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                className="p-2 border rounded-lg"
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="p-2 border rounded-lg"
              />
            </div>
            <button
              onClick={handleAddTask}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Adicionar Tarefa
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Pendentes</h3>
            {tasks.filter(t => !t.completed).map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <p className="text-gray-800 font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.assignedTo} • {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <h3 className="font-semibold text-gray-700 mt-6">Concluídas</h3>
            {tasks.filter(t => t.completed).map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500 opacity-60">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <p className="text-gray-800 line-through">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.assignedTo}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Shopping List Module
  const renderShoppingList = () => {
    const handleToggleItem = (id) => {
      setShoppingList({
        ...shoppingList,
        items: shoppingList.items.map(item =>
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      });
    };

    const handleAddItem = () => {
      if (newShoppingItem.name.trim()) {
        setShoppingList({
          ...shoppingList,
          items: [...shoppingList.items, {
            id: Date.now(),
            name: newShoppingItem.name,
            quantity: newShoppingItem.quantity,
            category: newShoppingItem.category || 'Geral',
            checked: false
          }]
        });
        setNewShoppingItem({ name: '', quantity: '', category: '' });
      }
    };

    const handleDeleteItem = (id) => {
      setShoppingList({
        ...shoppingList,
        items: shoppingList.items.filter(item => item.id !== id)
      });
    };

    const groupedItems = shoppingList.items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Lista de Compras</h2>
            <span className="text-gray-600 font-semibold">{shoppingList.month}</span>
          </div>

          <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Item..."
                value={newShoppingItem.name}
                onChange={(e) => setNewShoppingItem({ ...newShoppingItem, name: e.target.value })}
                className="p-2 border rounded-lg col-span-2"
              />
              <input
                type="text"
                placeholder="Qtd..."
                value={newShoppingItem.quantity}
                onChange={(e) => setNewShoppingItem({ ...newShoppingItem, quantity: e.target.value })}
                className="p-2 border rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Categoria..."
              value={newShoppingItem.category}
              onChange={(e) => setNewShoppingItem({ ...newShoppingItem, category: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
            <button
              onClick={handleAddItem}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Adicionar Item
            </button>
          </div>

          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-lg">{category}</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${item.checked ? 'bg-green-50 opacity-60' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleItem(item.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <div>
                        <span className={`text-gray-800 ${item.checked ? 'line-through' : ''}`}>
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">({item.quantity})</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Financial Module
  const renderFinancial = () => {
    const handleAddExpense = () => {
      if (newExpense.description.trim() && newExpense.value) {
        setExpenses([...expenses, {
          id: Date.now(),
          description: newExpense.description,
          value: parseFloat(newExpense.value),
          date: newExpense.date || new Date().toISOString().split('T')[0],
          category: newExpense.category || 'Geral'
        }]);
        setNewExpense({ description: '', value: '', date: '', category: '' });
      }
    };

    const handleDeleteExpense = (id) => {
      setExpenses(expenses.filter(exp => exp.id !== id));
    };

    const totalByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.value;
      return acc;
    }, {});

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Financeiro da Casa</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90">Total de Gastos</p>
              <p className="text-3xl font-bold">R$ {totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90">Média Mensal</p>
              <p className="text-3xl font-bold">R$ {(totalExpenses / 1).toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90">Categorias</p>
              <p className="text-3xl font-bold">{Object.keys(totalByCategory).length}</p>
            </div>
          </div>

          <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Descrição do gasto..."
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Valor (R$)..."
                value={newExpense.value}
                onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
                className="p-2 border rounded-lg"
              />
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="p-2 border rounded-lg"
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="p-2 border rounded-lg"
              >
                <option value="">Categoria...</option>
                <option value="Fixo">Fixo</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Novo item">Novo item</option>
                <option value="Geral">Geral</option>
              </select>
            </div>
            <button
              onClick={handleAddExpense}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Adicionar Gasto
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Gastos por Categoria</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(totalByCategory).map(([category, total]) => (
                <div key={category} className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">{category}</p>
                  <p className="text-xl font-bold text-gray-800">R$ {total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 mb-3">Histórico de Gastos</h3>
            {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-600">
                    {expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-green-600">R$ {expense.value.toFixed(2)}</span>
                  <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Future Items Module
  const renderFutureItems = () => {
    const handleAddItem = () => {
      if (newFutureItem.name.trim()) {
        setFutureItems([...futureItems, {
          id: Date.now(),
          name: newFutureItem.name,
          priority: newFutureItem.priority,
          estimatedCost: newFutureItem.estimatedCost
        }]);
        setNewFutureItem({ name: '', priority: 'média', estimatedCost: '' });
      }
    };

    const handleDeleteItem = (id) => {
      setFutureItems(futureItems.filter(item => item.id !== id));
    };

    const priorityColors = {
      'alta': 'border-red-500 bg-red-50',
      'média': 'border-yellow-500 bg-yellow-50',
      'baixa': 'border-green-500 bg-green-50'
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Itens para Comprar no Futuro</h2>

          <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Nome do item..."
              value={newFutureItem.name}
              onChange={(e) => setNewFutureItem({ ...newFutureItem, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newFutureItem.priority}
                onChange={(e) => setNewFutureItem({ ...newFutureItem, priority: e.target.value })}
                className="p-2 border rounded-lg"
              >
                <option value="alta">Alta prioridade</option>
                <option value="média">Média prioridade</option>
                <option value="baixa">Baixa prioridade</option>
              </select>
              <input
                type="text"
                placeholder="Custo estimado..."
                value={newFutureItem.estimatedCost}
                onChange={(e) => setNewFutureItem({ ...newFutureItem, estimatedCost: e.target.value })}
                className="p-2 border rounded-lg"
              />
            </div>
            <button
              onClick={handleAddItem}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
            >
              Adicionar Item
            </button>
          </div>

          <div className="space-y-3">
            {['alta', 'média', 'baixa'].map(priority => {
              const itemsInPriority = futureItems.filter(item => item.priority === priority);
              if (itemsInPriority.length === 0) return null;
              
              return (
                <div key={priority}>
                  <h3 className="font-semibold text-gray-700 mb-2 capitalize">Prioridade {priority}</h3>
                  {itemsInPriority.map(item => (
                    <div key={item.id} className={`flex items-center justify-between p-4 rounded-lg border-l-4 mb-2 ${priorityColors[priority]}`}>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.estimatedCost}</p>
                      </div>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Calendar Module
  const renderCalendar = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendário da Casa</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
            <p className="text-blue-800">
              <strong>Integração com Google Calendar:</strong> Para integrar seu Google Calendar, você precisará configurar a autenticação OAuth2 no backend da aplicação.
            </p>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Calendar size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Calendário em breve!</p>
            <p className="text-sm mt-2">A integração com Google Calendar será implementada na próxima versão.</p>
          </div>
        </div>
      </div>
    );
  };

  // Navigation
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'tasks', name: 'Tarefas', icon: CheckSquare },
    { id: 'shopping', name: 'Lista de Compras', icon: ShoppingCart },
    { id: 'financial', name: 'Financeiro', icon: DollarSign },
    { id: 'future', name: 'Compras Futuras', icon: Package },
    { id: 'calendar', name: 'Calendário', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">🏠 Gerenciador da Casa</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto py-3">
            {modules.map(module => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setCurrentModule(module.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    currentModule === module.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  <span>{module.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentModule === 'dashboard' && renderDashboard()}
        {currentModule === 'tasks' && renderTasks()}
        {currentModule === 'shopping' && renderShoppingList()}
        {currentModule === 'financial' && renderFinancial()}
        {currentModule === 'future' && renderFutureItems()}
        {currentModule === 'calendar' && renderCalendar()}
      </main>
    </div>
  );
};

export default HomeManagerApp;
