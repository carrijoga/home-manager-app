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
 * Incluindo tarefas dos últimos meses para suportar análises de tendência
 * @type {Task[]}
 */
export const mockTasks = [
  // Novembro 2025 (mês atual e futuro próximo)
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
    dueDate: '2025-11-03'
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
  },
  // Outubro 2025
  {
    id: 3,
    title: 'Pagar conta de luz',
    assignedTo: 'Geral',
    completed: true,
    dueDate: '2025-10-28'
  },
  {
    id: 6,
    title: 'Trocar lâmpada da sala',
    assignedTo: 'João',
    completed: true,
    dueDate: '2025-10-20'
  },
  {
    id: 7,
    title: 'Fazer compras do mês',
    assignedTo: 'Maria',
    completed: true,
    dueDate: '2025-10-15'
  },
  {
    id: 8,
    title: 'Limpar quintal',
    assignedTo: 'Pedro',
    completed: false,
    dueDate: '2025-10-25'
  },
  // Setembro 2025
  {
    id: 9,
    title: 'Organizar guarda-roupa',
    assignedTo: 'Maria',
    completed: true,
    dueDate: '2025-09-20'
  },
  {
    id: 10,
    title: 'Pagar condomínio',
    assignedTo: 'Geral',
    completed: true,
    dueDate: '2025-09-10'
  },
  {
    id: 11,
    title: 'Limpar cozinha',
    assignedTo: 'João',
    completed: true,
    dueDate: '2025-09-15'
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
      category: 'Alimentos',
      price: 30
    },
    {
      id: 2,
      name: 'Feijão',
      quantity: '2kg',
      checked: false,
      category: 'Alimentos',
      price: 15
    },
    {
      id: 3,
      name: 'Detergente',
      quantity: '3un',
      checked: true,
      category: 'Limpeza',
      price: 9
    },
    {
      id: 4,
      name: 'Sabão em pó',
      quantity: '2un',
      checked: false,
      category: 'Limpeza',
      price: 25
    },
    {
      id: 5,
      name: 'Macarrão',
      quantity: '3 pacotes',
      checked: false,
      category: 'Alimentos',
      price: 12
    },
    {
      id: 6,
      name: 'Papel higiênico',
      quantity: '12un',
      checked: false,
      category: 'Limpeza',
      price: 35
    },
    {
      id: 7,
      name: 'Café',
      quantity: '500g',
      checked: true,
      category: 'Alimentos',
      price: 18
    },
    {
      id: 8,
      name: 'Açúcar',
      quantity: '1kg',
      checked: false,
      category: 'Alimentos',
      price: 5
    }
  ]
};

/**
 * Gastos/Despesas mockados
 * Incluindo gastos dos últimos 6 meses para suportar gráficos de tendência
 * @type {Expense[]}
 */
export const mockExpenses = [
  // Outubro 2025 (mês atual)
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
  },
  // Setembro 2025
  {
    id: 8,
    description: 'Aluguel',
    value: 1500,
    date: '2025-09-05',
    category: 'Fixo'
  },
  {
    id: 9,
    description: 'Conta de luz',
    value: 280,
    date: '2025-09-10',
    category: 'Fixo'
  },
  {
    id: 10,
    description: 'Conta de água',
    value: 75,
    date: '2025-09-12',
    category: 'Fixo'
  },
  {
    id: 11,
    description: 'Internet',
    value: 120,
    date: '2025-09-15',
    category: 'Fixo'
  },
  {
    id: 12,
    description: 'Compras do mês',
    value: 650,
    date: '2025-09-20',
    category: 'Geral'
  },
  // Agosto 2025
  {
    id: 13,
    description: 'Aluguel',
    value: 1500,
    date: '2025-08-05',
    category: 'Fixo'
  },
  {
    id: 14,
    description: 'Conta de luz',
    value: 220,
    date: '2025-08-10',
    category: 'Fixo'
  },
  {
    id: 15,
    description: 'Conta de água',
    value: 85,
    date: '2025-08-12',
    category: 'Fixo'
  },
  {
    id: 16,
    description: 'Internet',
    value: 120,
    date: '2025-08-15',
    category: 'Fixo'
  },
  {
    id: 17,
    description: 'Compras do mês',
    value: 700,
    date: '2025-08-18',
    category: 'Geral'
  },
  // Julho 2025
  {
    id: 18,
    description: 'Aluguel',
    value: 1500,
    date: '2025-07-05',
    category: 'Fixo'
  },
  {
    id: 19,
    description: 'Conta de luz',
    value: 300,
    date: '2025-07-10',
    category: 'Fixo'
  },
  {
    id: 20,
    description: 'Conta de água',
    value: 90,
    date: '2025-07-12',
    category: 'Fixo'
  },
  {
    id: 21,
    description: 'Internet',
    value: 120,
    date: '2025-07-15',
    category: 'Fixo'
  },
  {
    id: 22,
    description: 'Compras do mês',
    value: 850,
    date: '2025-07-18',
    category: 'Geral'
  },
  // Junho 2025
  {
    id: 23,
    description: 'Aluguel',
    value: 1500,
    date: '2025-06-05',
    category: 'Fixo'
  },
  {
    id: 24,
    description: 'Conta de luz',
    value: 240,
    date: '2025-06-10',
    category: 'Fixo'
  },
  {
    id: 25,
    description: 'Conta de água',
    value: 70,
    date: '2025-06-12',
    category: 'Fixo'
  },
  {
    id: 26,
    description: 'Internet',
    value: 120,
    date: '2025-06-15',
    category: 'Fixo'
  },
  {
    id: 27,
    description: 'Compras do mês',
    value: 600,
    date: '2025-06-18',
    category: 'Geral'
  },
  // Maio 2025
  {
    id: 28,
    description: 'Aluguel',
    value: 1500,
    date: '2025-05-05',
    category: 'Fixo'
  },
  {
    id: 29,
    description: 'Conta de luz',
    value: 230,
    date: '2025-05-10',
    category: 'Fixo'
  },
  {
    id: 30,
    description: 'Conta de água',
    value: 80,
    date: '2025-05-12',
    category: 'Fixo'
  },
  {
    id: 31,
    description: 'Internet',
    value: 120,
    date: '2025-05-15',
    category: 'Fixo'
  },
  {
    id: 32,
    description: 'Compras do mês',
    value: 750,
    date: '2025-05-18',
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
    estimatedCost: 'R$ 2.500',
    estimatedValue: 2500,
    status: 'planned'
  },
  {
    id: 2,
    name: 'Aspirador de pó',
    priority: 'alta',
    estimatedCost: 'R$ 800',
    estimatedValue: 800,
    status: 'planned'
  },
  {
    id: 3,
    name: 'TV 50 polegadas',
    priority: 'baixa',
    estimatedCost: 'R$ 2.000',
    estimatedValue: 2000,
    status: 'planned'
  },
  {
    id: 4,
    name: 'Geladeira nova',
    priority: 'alta',
    estimatedCost: 'R$ 3.500',
    estimatedValue: 3500,
    status: 'planned'
  },
  {
    id: 5,
    name: 'Mesa de jantar',
    priority: 'média',
    estimatedCost: 'R$ 1.200',
    estimatedValue: 1200,
    status: 'planned'
  }
];

export default {
  mockNotices,
  mockTasks,
  mockShoppingList,
  mockExpenses,
  mockFutureItems
};
