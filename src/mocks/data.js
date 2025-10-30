/**
 * @fileoverview Dados mockados para o aplicativo Home Manager
 * Estes dados simulam o que virá da API futura
 */

/**
 * Avisos/Notícias mockados
 * @type {Notice[]}
 */
export const mockNotices = [
  {
    id: 1,
    text: 'Lembrete: Reunião de condomínio sexta-feira às 19h',
    author: 'João',
    date: '2025-10-28'
  },
  {
    id: 2,
    text: 'Encanador virá terça-feira para verificar o chuveiro',
    author: 'Maria',
    date: '2025-10-29'
  },
  {
    id: 3,
    text: 'Lembrar de pagar a conta de água até dia 15',
    author: 'Pedro',
    date: '2025-10-27'
  }
];

/**
 * Tarefas mockadas
 * @type {Task[]}
 */
export const mockTasks = [
  {
    id: 1,
    title: 'Limpar a geladeira',
    assignedTo: 'Maria',
    completed: false,
    dueDate: '2025-11-02'
  },
  {
    id: 2,
    title: 'Levar o lixo para fora',
    assignedTo: 'João',
    completed: false,
    dueDate: '2025-10-30'
  },
  {
    id: 3,
    title: 'Pagar conta de luz',
    assignedTo: 'Geral',
    completed: true,
    dueDate: '2025-10-28'
  },
  {
    id: 4,
    title: 'Limpar o banheiro',
    assignedTo: 'Pedro',
    completed: false,
    dueDate: '2025-11-01'
  },
  {
    id: 5,
    title: 'Organizar a despensa',
    assignedTo: 'Maria',
    completed: false,
    dueDate: '2025-11-05'
  }
];

/**
 * Lista de compras mockada
 * @type {ShoppingList}
 */
export const mockShoppingList = {
  month: 'Outubro 2025',
  items: [
    {
      id: 1,
      name: 'Arroz',
      quantity: '5kg',
      checked: false,
      category: 'Alimentos'
    },
    {
      id: 2,
      name: 'Feijão',
      quantity: '2kg',
      checked: false,
      category: 'Alimentos'
    },
    {
      id: 3,
      name: 'Detergente',
      quantity: '3un',
      checked: true,
      category: 'Limpeza'
    },
    {
      id: 4,
      name: 'Sabão em pó',
      quantity: '2un',
      checked: false,
      category: 'Limpeza'
    },
    {
      id: 5,
      name: 'Macarrão',
      quantity: '3 pacotes',
      checked: false,
      category: 'Alimentos'
    },
    {
      id: 6,
      name: 'Papel higiênico',
      quantity: '12un',
      checked: false,
      category: 'Limpeza'
    },
    {
      id: 7,
      name: 'Café',
      quantity: '500g',
      checked: true,
      category: 'Alimentos'
    },
    {
      id: 8,
      name: 'Açúcar',
      quantity: '1kg',
      checked: false,
      category: 'Alimentos'
    }
  ]
};

/**
 * Gastos/Despesas mockados
 * @type {Expense[]}
 */
export const mockExpenses = [
  {
    id: 1,
    description: 'Conserto do chuveiro',
    value: 150,
    date: '2025-10-25',
    category: 'Manutenção'
  },
  {
    id: 2,
    description: 'Micro-ondas novo',
    value: 450,
    date: '2025-10-20',
    category: 'Novo item'
  },
  {
    id: 3,
    description: 'Aluguel',
    value: 1500,
    date: '2025-10-05',
    category: 'Fixo'
  },
  {
    id: 4,
    description: 'Conta de luz',
    value: 250,
    date: '2025-10-10',
    category: 'Fixo'
  },
  {
    id: 5,
    description: 'Conta de água',
    value: 80,
    date: '2025-10-12',
    category: 'Fixo'
  },
  {
    id: 6,
    description: 'Internet',
    value: 120,
    date: '2025-10-15',
    category: 'Fixo'
  },
  {
    id: 7,
    description: 'Compras do mês',
    value: 800,
    date: '2025-10-18',
    category: 'Geral'
  }
];

/**
 * Itens futuros mockados
 * @type {FutureItem[]}
 */
export const mockFutureItems = [
  {
    id: 1,
    name: 'Sofá novo',
    priority: 'média',
    estimatedCost: 'R$ 2.500'
  },
  {
    id: 2,
    name: 'Aspirador de pó',
    priority: 'alta',
    estimatedCost: 'R$ 800'
  },
  {
    id: 3,
    name: 'TV 50 polegadas',
    priority: 'baixa',
    estimatedCost: 'R$ 2.000'
  },
  {
    id: 4,
    name: 'Geladeira nova',
    priority: 'alta',
    estimatedCost: 'R$ 3.500'
  },
  {
    id: 5,
    name: 'Mesa de jantar',
    priority: 'média',
    estimatedCost: 'R$ 1.200'
  }
];

export default {
  mockNotices,
  mockTasks,
  mockShoppingList,
  mockExpenses,
  mockFutureItems
};
