/**
 * Dados mockados do app Ninho.
 * Usado nos services em DATA_MODE === 'mock'.
 * Cada array usa `satisfies` para garantir conformidade com os tipos em build.
 */

import { getItemEstimatedTotal, getItemSpentTotal } from '@/components/modules/Shopping/helpers';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { type CategoryResponse as UnifiedCategoryResponse, CategoryScope } from '@/schemas/category';
import type {
  FinancialTransactionPaymentResponse,
  FinancialTransactionResponse,
} from '@/schemas/financial';
import type { PaymentCardInvoice, PaymentCardResponse } from '@/schemas/payment-card';
import type {
  AppNotification,
  AppShoppingCategory,
  AppShoppingItem,
  AppShoppingList,
  AppShoppingListSummary,
  Notice,
  Task,
} from '@/types';
import { ApiCategory, ApiPriority } from '@/types';

export const MOCK_USER_ID = 'user-mock-0001';

export const mockWeather = {
  city: 'São Paulo',
  temperature: 24,
  temperatureMin: 20.1,
  temperatureMax: 26.3,
  description: 'Parcialmente nublado',
  source: 'manual',
  conditionCode: '800',
  observedAt: '2026-09-11T14:00:00Z',
} as const;

// ── Notificações ─────────────────────────────────────────────────────────────

export const mockNotifications = [
  {
    notificationId: 'notif-1',
    title: 'Tarefa vencendo hoje',
    message: 'A tarefa "Pagar conta de luz" vence hoje.',
    type: 1, // Warning
    isRead: false,
    isEnabled: true,
  },
  {
    notificationId: 'notif-2',
    title: 'Nova tarefa atribuída',
    message: 'Maria atribuiu a tarefa "Organizar despensa" para você.',
    type: 0, // Info
    isRead: false,
    isEnabled: true,
  },
  {
    notificationId: 'notif-3',
    title: 'Pagamento atrasado',
    message: 'A despesa "Aluguel" está em atraso há 3 dias.',
    type: 2, // Error
    isRead: true,
    isEnabled: true,
  },
  {
    notificationId: 'notif-4',
    title: 'Compra concluída',
    message: '"Micro-ondas" foi marcado como comprado por João.',
    type: 3, // Success
    isRead: true,
    isEnabled: true,
  },
] satisfies AppNotification[];

// ── Avisos ────────────────────────────────────────────────────────────────────

const now = new Date();
const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const in12h = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();

export const mockNotices: Notice[] = [
  // ── Ativos ────────────────────────────────────────────────────────────────
  {
    noticeId: 'notice-mock-0001',
    message: 'Reunião de condomínio sexta-feira às 19h. Favor confirmar presença!',
    date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    isPinned: true,
    priority: ApiPriority.Urgente,
    expiresAt: null,
    isActive: true,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    authorName: 'João',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    color: 'yellow',
    reactions: [
      {
        reactionId: 'r-1',
        noticeId: 'notice-mock-0001',
        userId: 'user-mock-0002',
        userName: 'Maria',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        emoji: '👍',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        reactionId: 'r-2',
        noticeId: 'notice-mock-0001',
        userId: 'user-mock-0003',
        userName: 'Pedro',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        emoji: '❤️',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    noticeId: 'notice-mock-0002',
    message: 'Encanador virá amanhã para verificar o chuveiro. Liberar acesso ao banheiro.',
    date: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    priority: ApiPriority.Alta,
    expiresAt: in24h,
    isActive: true,
    createdBy: 'user-mock-0002',
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    authorName: 'Maria',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    color: 'pink',
    reactions: [
      {
        reactionId: 'r-3',
        noticeId: 'notice-mock-0002',
        userId: MOCK_USER_ID,
        userName: 'Você',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        emoji: '👏',
        createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    noticeId: 'notice-mock-0003',
    message: 'Pagar conta de água até dia 15. Boleto no armário da cozinha.',
    date: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    isPinned: false,
    priority: ApiPriority.Media,
    expiresAt: in12h,
    isActive: true,
    createdBy: 'user-mock-0003',
    createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    authorName: 'Pedro',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    color: 'green',
    reactions: [],
  },
  {
    noticeId: 'notice-mock-0004',
    message: 'Não esquecer de comprar detergente e sabão em pó na próxima saída.',
    date: now.toISOString(),
    isPinned: false,
    priority: ApiPriority.Baixa,
    expiresAt: in24h,
    isActive: true,
    createdBy: MOCK_USER_ID,
    createdAt: now.toISOString(),
    authorName: 'Você',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    color: 'blue',
    reactions: [],
  },
  // ── Histórico (expirados / inativos ou dias passados não pinados) ────────
  {
    noticeId: 'notice-mock-0005',
    message: 'Conta de luz paga com sucesso! Vencimento era dia 10.',
    date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    priority: ApiPriority.Baixa,
    expiresAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    createdBy: 'user-mock-0001',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'João',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    color: 'orange',
    reactions: [],
  },
  {
    noticeId: 'notice-mock-0006',
    message: 'Limpeza geral da casa foi concluída! Ótimo trabalho equipe! 🎉',
    date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    priority: ApiPriority.Baixa,
    expiresAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    createdBy: 'user-mock-0002',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'Maria',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    color: 'green',
    reactions: [],
  },
  {
    noticeId: 'notice-mock-0007',
    message: 'Manutenção do portão agendada para semana passada foi realizada.',
    date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    priority: ApiPriority.Baixa,
    expiresAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    createdBy: 'user-mock-0003',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'Pedro',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    color: 'blue',
    reactions: [],
  },
];

// ── Tarefas ───────────────────────────────────────────────────────────────────

export const mockTasks: Task[] = [
  // Pendentes — prioridades variadas
  {
    taskId: 'task-mock-0001',
    title: 'Limpar a geladeira',
    description: 'Remover itens vencidos e higienizar prateleiras',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Alta,
    priorityLabel: 'Alta',
    category: ApiCategory.Limpeza,
    categoryLabel: 'Limpeza',
    date: now.toISOString(),
    isCompleted: false,
    completedAt: null,
    isOverdue: false,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    taskId: 'task-mock-0002',
    title: 'Levar o lixo para fora',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Urgente,
    priorityLabel: 'Urgente',
    category: ApiCategory.Limpeza,
    categoryLabel: 'Limpeza',
    date: now.toISOString(),
    isCompleted: false,
    completedAt: null,
    isOverdue: true,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    taskId: 'task-mock-0003',
    title: 'Limpar o banheiro',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Media,
    priorityLabel: 'Média',
    category: ApiCategory.Limpeza,
    categoryLabel: 'Limpeza',
    date: now.toISOString(),
    isCompleted: false,
    completedAt: null,
    isOverdue: false,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    taskId: 'task-mock-0004',
    title: 'Organizar a despensa',
    description: 'Verificar validades e organizar por categoria',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Baixa,
    priorityLabel: 'Baixa',
    category: ApiCategory.Geral,
    categoryLabel: 'Geral',
    date: now.toISOString(),
    isCompleted: false,
    completedAt: null,
    isOverdue: false,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    taskId: 'task-mock-0005',
    title: 'Limpar quintal',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Media,
    priorityLabel: 'Média',
    category: ApiCategory.Limpeza,
    categoryLabel: 'Limpeza',
    date: now.toISOString(),
    isCompleted: false,
    completedAt: null,
    isOverdue: true,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Concluídas
  {
    taskId: 'task-mock-0006',
    title: 'Pagar conta de luz',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Alta,
    priorityLabel: 'Alta',
    category: ApiCategory.Financas,
    categoryLabel: 'Finanças',
    date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: true,
    completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isOverdue: false,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    taskId: 'task-mock-0007',
    title: 'Trocar lâmpada da sala',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Baixa,
    priorityLabel: 'Baixa',
    category: ApiCategory.Manutencao,
    categoryLabel: 'Manutenção',
    date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: true,
    completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isOverdue: false,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    taskId: 'task-mock-0008',
    title: 'Fazer compras do mês',
    assignees: [
      {
        userId: MOCK_USER_ID,
        name: 'Você',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    priority: ApiPriority.Alta,
    priorityLabel: 'Alta',
    category: ApiCategory.Geral,
    categoryLabel: 'Geral',
    date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: true,
    completedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isOverdue: false,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Categorias de compra (padrões do sistema) ─────────────────────────────────

export const mockShoppingCategories: AppShoppingCategory[] = [
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    nestId: null,
    name: 'Alimentos',
    description: 'Produtos alimentícios',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000002',
    nestId: null,
    name: 'Limpeza',
    description: 'Produtos de limpeza',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000003',
    nestId: null,
    name: 'Higiene',
    description: 'Produtos de higiene pessoal',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000004',
    nestId: null,
    name: 'Geral',
    description: 'Itens diversos',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000005',
    nestId: null,
    name: 'Bebidas',
    description: 'Bebidas e refrigerantes',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000006',
    nestId: null,
    name: 'Vestuário',
    description: 'Roupas e acessórios',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000007',
    nestId: null,
    name: 'Eletrônicos',
    description: 'Aparelhos eletrônicos',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000008',
    nestId: null,
    name: 'Móveis',
    description: 'Móveis e decoração',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000009',
    nestId: null,
    name: 'Brinquedos',
    description: 'Brinquedos e jogos infantis',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000010',
    nestId: null,
    name: 'Papelaria',
    description: 'Artigos de papelaria',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000011',
    nestId: null,
    name: 'Medicamentos',
    description: 'Medicamentos e produtos farmacêuticos',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000012',
    nestId: null,
    name: 'PetShop',
    description: 'Produtos para animais de estimação',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000013',
    nestId: null,
    name: 'Ferramentas',
    description: 'Ferramentas e materiais de construção',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000014',
    nestId: null,
    name: 'Esportes',
    description: 'Equipamentos esportivos',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000015',
    nestId: null,
    name: 'Beleza',
    description: 'Produtos de beleza e cosméticos',
    isDefault: true,
  },
  {
    shoppingCategoryId: 'cat-0001-0000-0000-000000000016',
    nestId: null,
    name: 'Outro',
    description: 'Outros',
    isDefault: true,
  },
] satisfies AppShoppingCategory[];

// ── Lista de compras ──────────────────────────────────────────────────────────

const toIsoDate = (date: Date): string => date.toISOString().split('T')[0];
const toIsoDateTimeDaysAgo = (daysAgo: number, hour = 10): string => {
  const date = new Date(now);
  date.setDate(now.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const getMonthStartIso = (monthsAgo: number): string =>
  new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1).toISOString();
const getMonthLabel = (monthsAgo: number): string =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  );
const getDateInMonth = (monthsAgo: number, day: number): string =>
  toIsoDate(new Date(now.getFullYear(), now.getMonth() - monthsAgo, day));

const mockShoppingItemsWeek1: AppShoppingItem[] = [
  {
    shoppingItemId: 'item-0001',
    shoppingListId: 'list-0001',
    name: 'Arroz',
    quantity: 5,
    unitType: 1,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    categoryName: 'Alimentos',
    isPurchased: true,
    status: 1,
    price: 34,
    estimatedPrice: 32,
    purchasedAt: toIsoDateTimeDaysAgo(26),
    notes: null,
  },
  {
    shoppingItemId: 'item-0002',
    shoppingListId: 'list-0001',
    name: 'Feijão',
    quantity: 2,
    unitType: 1,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    categoryName: 'Alimentos',
    isPurchased: true,
    status: 1,
    price: 19,
    estimatedPrice: 18,
    purchasedAt: toIsoDateTimeDaysAgo(26),
    notes: null,
  },
  {
    shoppingItemId: 'item-0003',
    shoppingListId: 'list-0001',
    name: 'Macarrão',
    quantity: 3,
    unitType: 7,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    categoryName: 'Alimentos',
    isPurchased: false,
    status: 3,
    price: null,
    estimatedPrice: 12,
    purchasedAt: null,
    notes: null,
  },
  {
    shoppingItemId: 'item-0004',
    shoppingListId: 'list-0001',
    name: 'Café',
    quantity: 500,
    unitType: 2,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    categoryName: 'Alimentos',
    isPurchased: false,
    status: 3,
    price: null,
    estimatedPrice: 24,
    purchasedAt: null,
    notes: null,
  },
  {
    shoppingItemId: 'item-0005',
    shoppingListId: 'list-0001',
    name: 'Detergente',
    quantity: 3,
    unitType: 0,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000002',
    categoryName: 'Limpeza',
    isPurchased: true,
    status: 1,
    price: 11,
    estimatedPrice: 10,
    purchasedAt: toIsoDateTimeDaysAgo(26),
    notes: null,
  },
  {
    shoppingItemId: 'item-0006',
    shoppingListId: 'list-0001',
    name: 'Sabão em pó',
    quantity: 2,
    unitType: 0,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000002',
    categoryName: 'Limpeza',
    isPurchased: false,
    status: 3,
    price: null,
    estimatedPrice: 25,
    purchasedAt: null,
    notes: null,
  },
  {
    shoppingItemId: 'item-0007',
    shoppingListId: 'list-0001',
    name: 'Papel higiênico',
    quantity: 12,
    unitType: 0,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000002',
    categoryName: 'Limpeza',
    isPurchased: false,
    status: 3,
    price: null,
    estimatedPrice: 39,
    purchasedAt: null,
    notes: null,
  },
  {
    shoppingItemId: 'item-0008',
    shoppingListId: 'list-0001',
    name: 'Shampoo',
    quantity: 1,
    unitType: 0,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000003',
    categoryName: 'Higiene',
    isPurchased: false,
    status: 3,
    price: null,
    estimatedPrice: 21,
    purchasedAt: null,
    notes: 'Sem sulfato',
  },
] satisfies AppShoppingItem[];

const mockShoppingItemsWeek2: AppShoppingItem[] = [
  {
    shoppingItemId: 'item-0009',
    shoppingListId: 'list-0002',
    name: 'Açúcar',
    quantity: 1,
    unitType: 1,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    categoryName: 'Alimentos',
    isPurchased: false,
    status: 0,
    price: null,
    estimatedPrice: 5,
    purchasedAt: null,
    notes: null,
  },
  {
    shoppingItemId: 'item-0010',
    shoppingListId: 'list-0002',
    name: 'Óleo de soja',
    quantity: 2,
    unitType: 0,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    categoryName: 'Alimentos',
    isPurchased: false,
    status: 0,
    price: null,
    estimatedPrice: 14,
    purchasedAt: null,
    notes: null,
  },
  {
    shoppingItemId: 'item-0011',
    shoppingListId: 'list-0002',
    name: 'Iogurte',
    quantity: 4,
    unitType: 0,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000001',
    categoryName: 'Alimentos',
    isPurchased: false,
    status: 0,
    price: null,
    estimatedPrice: 20,
    purchasedAt: null,
    notes: null,
  },
  {
    shoppingItemId: 'item-0012',
    shoppingListId: 'list-0002',
    name: 'Água sanitária',
    quantity: 2,
    unitType: 0,
    shoppingCategoryId: 'cat-0001-0000-0000-000000000002',
    categoryName: 'Limpeza',
    isPurchased: false,
    status: 0,
    price: null,
    estimatedPrice: 8,
    purchasedAt: null,
    notes: null,
  },
] satisfies AppShoppingItem[];

export const mockShoppingLists: AppShoppingListSummary[] = [
  {
    shoppingListId: 'list-0001',
    name: `Fechamento de ${getMonthLabel(1)}`,
    monthYear: getMonthStartIso(1),
    notes: 'Lista fechada do mês anterior',
    finished: true,
    finishedAt: getMonthStartIso(1),
    finishedBy: 'user-0001',
    isFinished: true,
    totalItems: mockShoppingItemsWeek1.length,
    purchasedItems: mockShoppingItemsWeek1.filter((i) => i.isPurchased).length,
    totalEstimated: mockShoppingItemsWeek1.reduce(
      (s, i) => s + getItemEstimatedTotal(i.estimatedPrice, i.quantity, i.unitType),
      0
    ),
    totalSpent: mockShoppingItemsWeek1
      .filter((i) => i.isPurchased)
      .reduce((s, i) => s + getItemSpentTotal(i.price, i.quantity, i.unitType), 0),
  },
  {
    shoppingListId: 'list-0002',
    name: `Planejamento de ${getMonthLabel(0)}`,
    monthYear: getMonthStartIso(0),
    notes: 'Reposição da semana atual',
    finished: false,
    finishedAt: null,
    finishedBy: null,
    isFinished: false,
    totalItems: mockShoppingItemsWeek2.length,
    purchasedItems: 0,
    totalEstimated: mockShoppingItemsWeek2.reduce(
      (s, i) => s + getItemEstimatedTotal(i.estimatedPrice, i.quantity, i.unitType),
      0
    ),
    totalSpent: 0,
  },
] satisfies AppShoppingListSummary[];

export const mockShoppingListDetails: Record<string, AppShoppingList> = {
  'list-0001': {
    shoppingListId: 'list-0001',
    name: `Fechamento de ${getMonthLabel(1)}`,
    monthYear: getMonthStartIso(1),
    notes: 'Lista fechada do mês anterior',
    finished: true,
    finishedAt: getMonthStartIso(1),
    finishedBy: 'user-0001',
    items: mockShoppingItemsWeek1,
  } satisfies AppShoppingList,
  'list-0002': {
    shoppingListId: 'list-0002',
    name: `Planejamento de ${getMonthLabel(0)}`,
    monthYear: getMonthStartIso(0),
    notes: 'Reposição da semana atual',
    finished: false,
    finishedAt: null,
    finishedBy: null,
    items: mockShoppingItemsWeek2,
  } satisfies AppShoppingList,
};

// ── Despesas (mock-only, não mapeia para FinancialTransactionResponse) ─────────

export interface MockExpense {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
}

interface MonthlyExpenseSeed {
  monthsAgo: number;
  rent: number;
  power: number;
  water: number;
  internet: number;
  groceries: number;
  extras: Array<{
    description: string;
    value: number;
    day: number;
    category: string;
  }>;
}

const monthlyExpenseSeeds: MonthlyExpenseSeed[] = [
  {
    monthsAgo: 0,
    rent: 1850,
    power: 278,
    water: 94,
    internet: 129,
    groceries: 915,
    extras: [
      { description: 'Farmácia', value: 174, day: 23, category: 'Saúde' },
      { description: 'Gás de cozinha', value: 128, day: 17, category: 'Casa' },
    ],
  },
  {
    monthsAgo: 1,
    rent: 1850,
    power: 301,
    water: 88,
    internet: 129,
    groceries: 972,
    extras: [{ description: 'Conserto da torneira', value: 160, day: 21, category: 'Manutenção' }],
  },
  {
    monthsAgo: 2,
    rent: 1800,
    power: 264,
    water: 82,
    internet: 119,
    groceries: 886,
    extras: [{ description: 'Material escolar', value: 242, day: 10, category: 'Família' }],
  },
  {
    monthsAgo: 3,
    rent: 1800,
    power: 246,
    water: 79,
    internet: 119,
    groceries: 838,
    extras: [
      { description: 'Petshop', value: 118, day: 14, category: 'Pet' },
      { description: 'Manutenção do portão', value: 210, day: 26, category: 'Manutenção' },
    ],
  },
  {
    monthsAgo: 4,
    rent: 1750,
    power: 232,
    water: 76,
    internet: 115,
    groceries: 804,
    extras: [{ description: 'Presente de aniversário', value: 140, day: 8, category: 'Família' }],
  },
  {
    monthsAgo: 5,
    rent: 1750,
    power: 219,
    water: 73,
    internet: 115,
    groceries: 792,
    extras: [{ description: 'Consulta médica', value: 220, day: 19, category: 'Saúde' }],
  },
];

export const mockExpenses: MockExpense[] = monthlyExpenseSeeds
  .flatMap((seed) => {
    const fixed: MockExpense[] = [
      {
        id: '',
        description: 'Aluguel',
        value: seed.rent,
        date: getDateInMonth(seed.monthsAgo, 5),
        category: 'Fixo',
      },
      {
        id: '',
        description: 'Conta de luz',
        value: seed.power,
        date: getDateInMonth(seed.monthsAgo, 10),
        category: 'Fixo',
      },
      {
        id: '',
        description: 'Conta de água',
        value: seed.water,
        date: getDateInMonth(seed.monthsAgo, 12),
        category: 'Fixo',
      },
      {
        id: '',
        description: 'Internet',
        value: seed.internet,
        date: getDateInMonth(seed.monthsAgo, 15),
        category: 'Fixo',
      },
      {
        id: '',
        description: 'Compras do mês',
        value: seed.groceries,
        date: getDateInMonth(seed.monthsAgo, 18),
        category: 'Geral',
      },
    ];

    const extras: MockExpense[] = seed.extras.map((extra) => ({
      id: '',
      description: extra.description,
      value: extra.value,
      date: getDateInMonth(seed.monthsAgo, extra.day),
      category: extra.category,
    }));

    return [...fixed, ...extras];
  })
  .map((expense, index) => ({
    ...expense,
    id: String(index + 1),
  }));

// ── Transações financeiras (FinancialTransactionResponse — modo mock) ─────────────

// IDs de mock não são UUIDs reais (convenção do arquivo: 'nest-mock-0001' etc.);
// os branches mock dos services não passam por safeParse.
export const mockFinancialCategories = [
  {
    categoryId: 'fincat-0000-0000-0000-000000000001',
    nestId: 'nest-mock-0001',
    name: 'Moradia',
    type: 1,
  },
  {
    categoryId: 'fincat-0000-0000-0000-000000000002',
    nestId: 'nest-mock-0001',
    name: 'Contas fixas',
    type: 1,
  },
  {
    categoryId: 'fincat-0000-0000-0000-000000000003',
    nestId: 'nest-mock-0001',
    name: 'Mercado',
    type: 1,
  },
  {
    categoryId: 'fincat-0000-0000-0000-000000000004',
    nestId: 'nest-mock-0001',
    name: 'Saúde',
    type: 1,
  },
  {
    categoryId: 'fincat-0000-0000-0000-000000000005',
    nestId: 'nest-mock-0001',
    name: 'Família',
    type: 1,
  },
  {
    categoryId: 'fincat-0000-0000-0000-000000000006',
    nestId: 'nest-mock-0001',
    name: 'Manutenção',
    type: 1,
  },
  {
    categoryId: 'fincat-0000-0000-0000-000000000007',
    nestId: 'nest-mock-0001',
    name: 'Pet',
    type: 1,
  },
  {
    categoryId: 'fincat-0000-0000-0000-000000000008',
    nestId: 'nest-mock-0001',
    name: 'Renda',
    type: 0,
  },
] satisfies Array<{ categoryId: string; nestId: string; name: string; type: number }>;

// ── Categorias unificadas (árvore por escopo) ─────────────────────────────────

function mockCat(
  id: string,
  scope: CategoryScope,
  name: string,
  icon: string,
  color: string,
  children: Array<[string, string, string]> = []
): UnifiedCategoryResponse {
  return {
    categoryId: id,
    scope,
    parentCategoryId: null,
    name,
    icon,
    color,
    children: children.map(([childId, childName, childIcon]) => ({
      categoryId: childId,
      scope,
      parentCategoryId: id,
      name: childName,
      icon: childIcon,
      color,
      children: [],
    })),
  };
}

export const mockCategoryTree: UnifiedCategoryResponse[] = [
  mockCat('c0000001-0000-4000-8000-000000000001', CategoryScope.Expense, 'Moradia', '🏠', '#3B82F6', [
    ['c0000001-0000-4000-8000-000000000011', 'Aluguel', '🔑'],
    ['c0000001-0000-4000-8000-000000000012', 'Energia', '💡'],
  ]),
  mockCat('c0000001-0000-4000-8000-000000000002', CategoryScope.Expense, 'Alimentação', '🍽️', '#F97316', [
    ['c0000001-0000-4000-8000-000000000021', 'Mercado', '🛒'],
  ]),
  mockCat('c0000001-0000-4000-8000-000000000003', CategoryScope.Expense, 'Transporte', '🚗', '#6366F1'),
  mockCat('c0000002-0000-4000-8000-000000000001', CategoryScope.Income, 'Salário', '💼', '#22C55E'),
  mockCat('c0000002-0000-4000-8000-000000000002', CategoryScope.Income, 'Extras', '💸', '#14B8A6', [
    ['c0000002-0000-4000-8000-000000000021', 'Freelance', '🤝'],
  ]),
  mockCat('c0000003-0000-4000-8000-000000000001', CategoryScope.Shopping, 'Hortifruti', '🥦', '#84CC16'),
  mockCat('c0000003-0000-4000-8000-000000000002', CategoryScope.Shopping, 'Limpeza', '🧼', '#06B6D4', [
    ['c0000003-0000-4000-8000-000000000021', 'Lavanderia', '🧺'],
  ]),
  mockCat('c0000003-0000-4000-8000-000000000003', CategoryScope.Shopping, 'Padaria', '🍞', '#F59E0B'),
  mockCat('c0000004-0000-4000-8000-000000000001', CategoryScope.Task, 'Limpeza', '🧹', '#06B6D4'),
  mockCat('c0000004-0000-4000-8000-000000000002', CategoryScope.Task, 'Cozinha', '🍳', '#EF4444'),
  mockCat('c0000004-0000-4000-8000-000000000003', CategoryScope.Task, 'Manutenção', '🛠️', '#64748B'),
];

const FIN_NEST_ID = 'nest-mock-0001';
const FIN_JOAO = { id: 'user-mock-0001', name: 'João (Você)' };

// Contador module-level: determinístico por avaliação do módulo (reinicia em HMR).
let finSeq = 0;

function makeFinPayment(
  transactionId: string,
  amount: number,
  dateIso: string
): FinancialTransactionPaymentResponse {
  finSeq += 1;
  return {
    financialTransactionPaymentId: `finpay-${String(finSeq).padStart(4, '0')}`,
    financialTransactionId: transactionId,
    nestId: FIN_NEST_ID,
    amount,
    discount: 0,
    interest: 0,
    method: 3,
    methodName: 'PIX',
    paymentDate: `${dateIso}T12:00:00.000Z`,
    paidByUserId: FIN_JOAO.id,
    paidByUserFullName: FIN_JOAO.name,
    observation: null,
    sourceType: 0, // BankAccount (method Pix deriva pra conta)
    sourceId: '11111111-1111-1111-1111-111111111111', // Conta Corrente (mockBankAccounts[0])
  };
}

interface FinTxSeed {
  type: 0 | 1;
  description: string;
  value: number;
  monthsAgo: number;
  day: number;
  /** Dia do vencimento (default: mesmo dia da transação) */
  dueDay?: number;
  categoryId: string;
  /** true = quitada; número = valor pago parcial */
  paid?: boolean | number;
  shoppingListId?: string | null;
  observation?: string | null;
  origin?: number;
  originName?: string;
}

function makeFinTx(seed: FinTxSeed): FinancialTransactionResponse {
  finSeq += 1;
  const id = `fintx-${String(finSeq).padStart(4, '0')}`;
  const dateIso = getDateInMonth(seed.monthsAgo, seed.day);
  const dueIso = getDateInMonth(seed.monthsAgo, seed.dueDay ?? seed.day);
  const category = mockFinancialCategories.find((c) => c.categoryId === seed.categoryId)!;
  // Quitação total é datada no vencimento; pagamento parcial na data da transação.
  const payments =
    seed.paid === true
      ? [makeFinPayment(id, seed.value, dueIso)]
      : typeof seed.paid === 'number'
        ? [makeFinPayment(id, seed.paid, dateIso)]
        : [];
  const paidSum = payments.reduce((sum, p) => sum + p.amount, 0);
  const paymentStatus = paidSum === 0 ? 0 : paidSum >= seed.value ? 2 : 1; // Open | Paid | PartiallyPaid
  const isPaid = paymentStatus === 2;
  return {
    financialTransactionId: id,
    nestId: FIN_NEST_ID,
    transactionType: seed.type,
    description: seed.description,
    value: seed.value,
    transactionDate: `${dateIso}T12:00:00.000Z`,
    dueDate: `${dueIso}T12:00:00.000Z`,
    responsibleUserId: FIN_JOAO.id,
    responsibleUserName: FIN_JOAO.name,
    categoryId: category.categoryId,
    categoryName: category.name,
    origin: seed.origin ?? (seed.shoppingListId ? 2 : 0),
    originName: seed.originName ?? (seed.shoppingListId ? 'Lista de Compras' : 'Financeiro'),
    observation:
      seed.observation ?? (seed.shoppingListId ? 'Gerado a partir da lista de compras' : null),
    // Income: aponta pra Conta Corrente mock; Expense: sempre null (fonte só via payments).
    sourceId: seed.type === 0 ? '11111111-1111-1111-1111-111111111111' : null,
    payments,
    paymentStatus,
    isOverdue: !isPaid && dueIso < toIsoDate(now),
    shoppingListId: seed.shoppingListId ?? null,
  };
}

const CAT = {
  moradia: 'fincat-0000-0000-0000-000000000001',
  contas: 'fincat-0000-0000-0000-000000000002',
  mercado: 'fincat-0000-0000-0000-000000000003',
  saude: 'fincat-0000-0000-0000-000000000004',
  familia: 'fincat-0000-0000-0000-000000000005',
  manutencao: 'fincat-0000-0000-0000-000000000006',
  pet: 'fincat-0000-0000-0000-000000000007',
  renda: 'fincat-0000-0000-0000-000000000008',
};

export const mockTransactions: FinancialTransactionResponse[] = (
  [
    // ── Mês atual: mistura de estados para exercitar todos os badges ────────────
    {
      type: 0,
      description: 'Salário',
      value: 8500,
      monthsAgo: 0,
      day: 1,
      categoryId: CAT.renda,
      paid: true,
    },
    {
      type: 1,
      description: 'Aluguel',
      value: 1850,
      monthsAgo: 0,
      day: 5,
      dueDay: 15,
      categoryId: CAT.moradia,
    },
    {
      type: 1,
      description: 'Conta de luz',
      value: 312,
      monthsAgo: 0,
      day: 2,
      dueDay: 5,
      categoryId: CAT.contas,
    },
    {
      type: 1,
      description: 'Conta de água',
      value: 90,
      monthsAgo: 0,
      day: 12,
      categoryId: CAT.contas,
      paid: true,
    },
    {
      type: 1,
      description: 'Internet',
      value: 129,
      monthsAgo: 0,
      day: 3,
      dueDay: 20,
      categoryId: CAT.contas,
    },
    {
      type: 1,
      description: 'Compras do mês',
      value: 740,
      monthsAgo: 0,
      day: 8,
      categoryId: CAT.mercado,
      paid: 370,
      shoppingListId: 'list-0001',
    },
    // ── Mês anterior: tudo quitado ───────────────────────────────────────────────
    {
      type: 0,
      description: 'Salário',
      value: 8500,
      monthsAgo: 1,
      day: 1,
      categoryId: CAT.renda,
      paid: true,
    },
    {
      type: 1,
      description: 'Aluguel',
      value: 1850,
      monthsAgo: 1,
      day: 5,
      categoryId: CAT.moradia,
      paid: true,
    },
    {
      type: 1,
      description: 'Conta de luz',
      value: 301,
      monthsAgo: 1,
      day: 10,
      categoryId: CAT.contas,
      paid: true,
    },
    {
      type: 1,
      description: 'Conta de água',
      value: 88,
      monthsAgo: 1,
      day: 12,
      categoryId: CAT.contas,
      paid: true,
    },
    {
      type: 1,
      description: 'Internet',
      value: 129,
      monthsAgo: 1,
      day: 15,
      categoryId: CAT.contas,
      paid: true,
    },
    {
      type: 1,
      description: 'Compras do mês',
      value: 972,
      monthsAgo: 1,
      day: 18,
      categoryId: CAT.mercado,
      paid: true,
    },
    {
      type: 1,
      description: 'Conserto da torneira',
      value: 160,
      monthsAgo: 1,
      day: 21,
      categoryId: CAT.manutencao,
      paid: true,
    },
    // ── Dois meses atrás ─────────────────────────────────────────────────────────
    {
      type: 0,
      description: 'Salário',
      value: 8500,
      monthsAgo: 2,
      day: 1,
      categoryId: CAT.renda,
      paid: true,
    },
    {
      type: 1,
      description: 'Aluguel',
      value: 1800,
      monthsAgo: 2,
      day: 5,
      categoryId: CAT.moradia,
      paid: true,
    },
    {
      type: 1,
      description: 'Conta de luz',
      value: 264,
      monthsAgo: 2,
      day: 10,
      categoryId: CAT.contas,
      paid: true,
    },
    {
      type: 1,
      description: 'Conta de água',
      value: 82,
      monthsAgo: 2,
      day: 12,
      categoryId: CAT.contas,
      paid: true,
    },
    {
      type: 1,
      description: 'Internet',
      value: 119,
      monthsAgo: 2,
      day: 15,
      categoryId: CAT.contas,
      paid: true,
    },
    {
      type: 1,
      description: 'Compras do mês',
      value: 886,
      monthsAgo: 2,
      day: 18,
      categoryId: CAT.mercado,
      paid: true,
    },
    {
      type: 1,
      description: 'Material escolar',
      value: 242,
      monthsAgo: 2,
      day: 10,
      categoryId: CAT.familia,
      paid: true,
    },
    {
      type: 1,
      description: 'Petshop',
      value: 118,
      monthsAgo: 2,
      day: 14,
      categoryId: CAT.pet,
      paid: true,
    },
  ] satisfies FinTxSeed[]
).map(makeFinTx);

// ── Cartões de crédito ───────────────────────────────────────────────────────

export const mockPaymentCards: PaymentCardResponse[] = [
  {
    paymentCardId: 'card-mock-0001',
    type: 0, // Credit
    name: 'Nubank',
    creditLimit: 5000,
    dueDay: 10,
    closingDay: 3,
    previousBalance: 0,
    color: '#820ad1',
    isActive: true,
    bankAccountId: '11111111-1111-1111-1111-111111111111',
  },
  {
    paymentCardId: 'card-mock-0002',
    type: 1, // Debit
    name: 'Inter Débito',
    creditLimit: null,
    dueDay: null,
    closingDay: null,
    previousBalance: null,
    color: '#ff7a00',
    isActive: true,
    bankAccountId: '22222222-2222-2222-2222-222222222222',
  },
  {
    paymentCardId: 'card-mock-0003',
    type: 2, // Prepaid
    name: 'Cartão Pré-pago',
    creditLimit: null,
    dueDay: null,
    closingDay: null,
    previousBalance: null,
    color: '#10b981',
    isActive: true,
    bankAccountId: null,
  },
  {
    paymentCardId: 'card-mock-0004',
    type: 3, // Other
    name: 'Vale Refeição',
    creditLimit: null,
    dueDay: null,
    closingDay: null,
    previousBalance: null,
    color: '#ec7000',
    isActive: false,
    bankAccountId: null,
  },
];

export const mockBankAccounts: BankAccountResponse[] = [
  {
    bankAccountId: '11111111-1111-1111-1111-111111111111',
    name: 'Conta Corrente',
    type: 0,
    isActive: true,
    balance: 3250.75,
    initialBalance: 1000,
    color: '#3b82f6',
    paymentCards: [
      {
        paymentCardId: 'card-mock-0001',
        bankAccountId: '11111111-1111-1111-1111-111111111111',
        type: 0,
        name: 'Nubank',
        color: '#820ad1',
        isActive: true,
      },
    ],
  },
  {
    bankAccountId: '22222222-2222-2222-2222-222222222222',
    name: 'Poupança',
    type: 1,
    isActive: true,
    balance: 12800,
    initialBalance: 12800,
    color: '#10b981',
    paymentCards: [
      {
        paymentCardId: 'card-mock-0002',
        bankAccountId: '22222222-2222-2222-2222-222222222222',
        type: 1,
        name: 'Inter Débito',
        color: '#ff7a00',
        isActive: true,
      },
    ],
  },
  {
    bankAccountId: '33333333-3333-3333-3333-333333333333',
    name: 'Carteira',
    type: 2,
    isActive: false,
    balance: 180.5,
    initialBalance: 180.5,
    color: '#f59e0b',
    paymentCards: [],
  },
];

// Quantidade de transações vinculadas por conta (mock do can-delete).
export const mockBankAccountLinkedCounts: Record<string, number> = {
  '11111111-1111-1111-1111-111111111111': 4,
  '22222222-2222-2222-2222-222222222222': 0,
  '33333333-3333-3333-3333-333333333333': 0,
};

// IDs de cartões com lançamento vinculado (mock do bloqueio de exclusão).
export const mockPaymentCardsWithLinkedTransactions = new Set<string>(['card-mock-0001']);

// Mock-only: fatura sem back-end. Chave = paymentCardId. Só cartões Credit têm fatura.
export const mockPaymentCardInvoices: Record<string, PaymentCardInvoice> = {
  'card-mock-0001': {
    paymentCardId: 'card-mock-0001',
    month: '2026-06',
    total: 537.3,
    items: [
      {
        id: 'inv-1',
        description: 'Mercado Extra',
        amount: 312.4,
        date: '2026-06-04',
        categoryName: 'Mercado',
        icon: '🛒',
      },
      {
        id: 'inv-2',
        description: 'Posto Shell',
        amount: 180.0,
        date: '2026-06-07',
        categoryName: 'Transporte',
        icon: '⛽',
      },
      {
        id: 'inv-3',
        description: 'Netflix',
        amount: 44.9,
        date: '2026-06-10',
        categoryName: 'Lazer',
        icon: '🎬',
      },
    ],
  },
};

// ── Eventos da agenda (dashboard) ───────────────────────────────────────────

const toIsoDateTimeInDays = (daysFromNow: number, hour: number, minute = 0): string => {
  const date = new Date(now);
  date.setDate(now.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const mockCalendarEvents = [
  {
    id: 'event-0001',
    title: 'Reunião da escola da Laura',
    startsAt: toIsoDateTimeInDays(0, 19, 30),
    location: 'Colégio Horizonte',
  },
  {
    id: 'event-0002',
    title: 'Consulta pediátrica',
    startsAt: toIsoDateTimeInDays(1, 10, 0),
    location: 'Clínica Vida',
  },
  {
    id: 'event-0003',
    title: 'Aniversário da vovó Célia',
    startsAt: toIsoDateTimeInDays(2, 16, 0),
    location: 'Casa da vovó',
  },
  {
    id: 'event-0004',
    title: 'Entrega do gás',
    startsAt: toIsoDateTimeInDays(4, 9, 0),
    location: 'Apartamento',
  },
] satisfies Array<{
  id: string;
  title: string;
  startsAt: string;
  location?: string;
}>;
