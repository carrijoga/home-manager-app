/**
 * Dados mockados do app Ninho.
 * Usado nos services em DATA_MODE === 'mock'.
 * Cada array usa `satisfies` para garantir conformidade com os tipos em build.
 */

import type { AppNotification, AppShoppingCategory, AppShoppingItem, AppShoppingList, AppShoppingListSummary, FutureItem, Notice, Task } from '@/types';
import { ApiCategory, ApiPriority, FutureItemStatus, Priority } from '@/types';

const MOCK_USER_ID = 'user-mock-0001';

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
    expiresAt: null,
    isActive: true,
    createdBy: MOCK_USER_ID,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    authorName: 'João',
    color: 'yellow',
  },
  {
    noticeId: 'notice-mock-0002',
    message: 'Encanador virá amanhã para verificar o chuveiro. Liberar acesso ao banheiro.',
    date: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    expiresAt: in24h,
    isActive: true,
    createdBy: 'user-mock-0002',
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    authorName: 'Maria',
    color: 'pink',
  },
  {
    noticeId: 'notice-mock-0003',
    message: 'Pagar conta de água até dia 15. Boleto no armário da cozinha.',
    date: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    isPinned: false,
    expiresAt: in12h,
    isActive: true,
    createdBy: 'user-mock-0003',
    createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    authorName: 'Pedro',
    color: 'green',
  },
  {
    noticeId: 'notice-mock-0004',
    message: 'Não esquecer de comprar detergente e sabão em pó na próxima saída.',
    date: now.toISOString(),
    isPinned: false,
    expiresAt: in24h,
    isActive: true,
    createdBy: MOCK_USER_ID,
    createdAt: now.toISOString(),
    authorName: 'Você',
    color: 'blue',
  },
  // ── Histórico (expirados / inativos) ──────────────────────────────────────
  {
    noticeId: 'notice-mock-0005',
    message: 'Conta de luz paga com sucesso! Vencimento era dia 10.',
    date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    expiresAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    createdBy: 'user-mock-0001',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'João',
    color: 'orange',
  },
  {
    noticeId: 'notice-mock-0006',
    message: 'Limpeza geral da casa foi concluída! Ótimo trabalho equipe! 🎉',
    date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    expiresAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    createdBy: 'user-mock-0002',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'Maria',
    color: 'green',
  },
  {
    noticeId: 'notice-mock-0007',
    message: 'Manutenção do portão agendada para semana passada foi realizada.',
    date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    expiresAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    createdBy: 'user-mock-0003',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'Pedro',
    color: 'blue',
  },
];

// ── Tarefas ───────────────────────────────────────────────────────────────────

export const mockTasks: Task[] = [
  // Pendentes — prioridades variadas
  {
    taskId: 'task-mock-0001',
    title: 'Limpar a geladeira',
    description: 'Remover itens vencidos e higienizar prateleiras',
    assignedTo: null,
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
    assignedTo: null,
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
    assignedTo: null,
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
    assignedTo: null,
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
    assignedTo: null,
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
    assignedTo: null,
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
    assignedTo: null,
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
    assignedTo: null,
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
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000001', nestId: null, name: 'Alimentos',    description: 'Produtos alimentícios',               isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000002', nestId: null, name: 'Limpeza',      description: 'Produtos de limpeza',                isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000003', nestId: null, name: 'Higiene',      description: 'Produtos de higiene pessoal',        isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000004', nestId: null, name: 'Geral',        description: 'Itens diversos',                     isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000005', nestId: null, name: 'Bebidas',      description: 'Bebidas e refrigerantes',            isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000006', nestId: null, name: 'Vestuário',    description: 'Roupas e acessórios',                isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000007', nestId: null, name: 'Eletrônicos',  description: 'Aparelhos eletrônicos',              isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000008', nestId: null, name: 'Móveis',       description: 'Móveis e decoração',                 isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000009', nestId: null, name: 'Brinquedos',   description: 'Brinquedos e jogos infantis',        isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000010', nestId: null, name: 'Papelaria',    description: 'Artigos de papelaria',               isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000011', nestId: null, name: 'Medicamentos', description: 'Medicamentos e produtos farmacêuticos', isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000012', nestId: null, name: 'PetShop',      description: 'Produtos para animais de estimação', isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000013', nestId: null, name: 'Ferramentas',  description: 'Ferramentas e materiais de construção', isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000014', nestId: null, name: 'Esportes',     description: 'Equipamentos esportivos',            isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000015', nestId: null, name: 'Beleza',       description: 'Produtos de beleza e cosméticos',   isDefault: true },
  { shoppingCategoryId: 'cat-0001-0000-0000-000000000016', nestId: null, name: 'Outro',        description: 'Outros',                             isDefault: true },
] satisfies AppShoppingCategory[];

// ── Lista de compras ──────────────────────────────────────────────────────────

const mockShoppingItemsWeek1: AppShoppingItem[] = [
  { shoppingItemId: 'item-0001', shoppingListId: 'list-0001', name: 'Arroz',          quantity: 5,  unitType: 1, shoppingCategoryId: 'cat-0001-0000-0000-000000000001', categoryName: 'Alimentos', isPurchased: true,  price: 32,   estimatedPrice: 30,  purchasedAt: '2026-03-05T10:00:00Z', notes: null },
  { shoppingItemId: 'item-0002', shoppingListId: 'list-0001', name: 'Feijão',         quantity: 2,  unitType: 1, shoppingCategoryId: 'cat-0001-0000-0000-000000000001', categoryName: 'Alimentos', isPurchased: true,  price: 16,   estimatedPrice: 15,  purchasedAt: '2026-03-05T10:00:00Z', notes: null },
  { shoppingItemId: 'item-0003', shoppingListId: 'list-0001', name: 'Macarrão',       quantity: 3,  unitType: 7, shoppingCategoryId: 'cat-0001-0000-0000-000000000001', categoryName: 'Alimentos', isPurchased: false, price: null, estimatedPrice: 12,  purchasedAt: null,                   notes: null },
  { shoppingItemId: 'item-0004', shoppingListId: 'list-0001', name: 'Café',           quantity: 500, unitType: 2, shoppingCategoryId: 'cat-0001-0000-0000-000000000001', categoryName: 'Alimentos', isPurchased: false, price: null, estimatedPrice: 22,  purchasedAt: null,                   notes: null },
  { shoppingItemId: 'item-0005', shoppingListId: 'list-0001', name: 'Detergente',     quantity: 3,  unitType: 0, shoppingCategoryId: 'cat-0001-0000-0000-000000000002', categoryName: 'Limpeza',   isPurchased: true,  price: 9,    estimatedPrice: 9,   purchasedAt: '2026-03-05T10:00:00Z', notes: null },
  { shoppingItemId: 'item-0006', shoppingListId: 'list-0001', name: 'Sabão em pó',    quantity: 2,  unitType: 0, shoppingCategoryId: 'cat-0001-0000-0000-000000000002', categoryName: 'Limpeza',   isPurchased: false, price: null, estimatedPrice: 25,  purchasedAt: null,                   notes: null },
  { shoppingItemId: 'item-0007', shoppingListId: 'list-0001', name: 'Papel higiênico', quantity: 12, unitType: 0, shoppingCategoryId: 'cat-0001-0000-0000-000000000002', categoryName: 'Limpeza',   isPurchased: false, price: null, estimatedPrice: 35,  purchasedAt: null,                   notes: null },
  { shoppingItemId: 'item-0008', shoppingListId: 'list-0001', name: 'Shampoo',        quantity: 1,  unitType: 0, shoppingCategoryId: 'cat-0001-0000-0000-000000000003', categoryName: 'Higiene',   isPurchased: false, price: null, estimatedPrice: 18,  purchasedAt: null,                   notes: 'Sem parabenos' },
] satisfies AppShoppingItem[];

const mockShoppingItemsWeek2: AppShoppingItem[] = [
  { shoppingItemId: 'item-0009', shoppingListId: 'list-0002', name: 'Açúcar',         quantity: 1,  unitType: 1, shoppingCategoryId: 'cat-0001-0000-0000-000000000001', categoryName: 'Alimentos', isPurchased: false, price: null, estimatedPrice: 5,   purchasedAt: null,                   notes: null },
  { shoppingItemId: 'item-0010', shoppingListId: 'list-0002', name: 'Óleo de soja',   quantity: 2,  unitType: 0, shoppingCategoryId: 'cat-0001-0000-0000-000000000001', categoryName: 'Alimentos', isPurchased: false, price: null, estimatedPrice: 14,  purchasedAt: null,                   notes: null },
  { shoppingItemId: 'item-0011', shoppingListId: 'list-0002', name: 'Iogurte',        quantity: 4,  unitType: 0, shoppingCategoryId: 'cat-0001-0000-0000-000000000001', categoryName: 'Alimentos', isPurchased: false, price: null, estimatedPrice: 20,  purchasedAt: null,                   notes: null },
  { shoppingItemId: 'item-0012', shoppingListId: 'list-0002', name: 'Água sanitária', quantity: 2,  unitType: 0, shoppingCategoryId: 'cat-0001-0000-0000-000000000002', categoryName: 'Limpeza',   isPurchased: false, price: null, estimatedPrice: 8,   purchasedAt: null,                   notes: null },
] satisfies AppShoppingItem[];

export const mockShoppingLists: AppShoppingListSummary[] = [
  {
    shoppingListId: 'list-0001',
    name: 'Semana 1 de Março',
    monthYear: '2026-03-01T00:00:00Z',
    notes: 'Compras do início do mês',
    totalItems: mockShoppingItemsWeek1.length,
    purchasedItems: mockShoppingItemsWeek1.filter(i => i.isPurchased).length,
    totalEstimated: mockShoppingItemsWeek1.reduce((s, i) => s + (i.estimatedPrice ?? 0), 0),
    totalSpent: mockShoppingItemsWeek1.filter(i => i.isPurchased).reduce((s, i) => s + (i.price ?? 0), 0),
  },
  {
    shoppingListId: 'list-0002',
    name: 'Semana 2 de Março',
    monthYear: '2026-03-01T00:00:00Z',
    notes: null,
    totalItems: mockShoppingItemsWeek2.length,
    purchasedItems: 0,
    totalEstimated: mockShoppingItemsWeek2.reduce((s, i) => s + (i.estimatedPrice ?? 0), 0),
    totalSpent: 0,
  },
] satisfies AppShoppingListSummary[];

export const mockShoppingListDetails: Record<string, AppShoppingList> = {
  'list-0001': {
    shoppingListId: 'list-0001',
    name: 'Semana 1 de Março',
    monthYear: '2026-03-01T00:00:00Z',
    notes: 'Compras do início do mês',
    items: mockShoppingItemsWeek1,
  } satisfies AppShoppingList,
  'list-0002': {
    shoppingListId: 'list-0002',
    name: 'Semana 2 de Março',
    monthYear: '2026-03-01T00:00:00Z',
    notes: null,
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

export const mockExpenses: MockExpense[] = [
  // Outubro 2025
  { id: '1', description: 'Conserto do chuveiro', value: 150, date: '2025-10-25', category: 'Manutenção' },
  { id: '2', description: 'Micro-ondas novo', value: 450, date: '2025-10-20', category: 'Novo item' },
  { id: '3', description: 'Aluguel', value: 1500, date: '2025-10-05', category: 'Fixo' },
  { id: '4', description: 'Conta de luz', value: 250, date: '2025-10-10', category: 'Fixo' },
  { id: '5', description: 'Conta de água', value: 80, date: '2025-10-12', category: 'Fixo' },
  { id: '6', description: 'Internet', value: 120, date: '2025-10-15', category: 'Fixo' },
  { id: '7', description: 'Compras do mês', value: 800, date: '2025-10-18', category: 'Geral' },
  // Setembro 2025
  { id: '8', description: 'Aluguel', value: 1500, date: '2025-09-05', category: 'Fixo' },
  { id: '9', description: 'Conta de luz', value: 280, date: '2025-09-10', category: 'Fixo' },
  { id: '10', description: 'Conta de água', value: 75, date: '2025-09-12', category: 'Fixo' },
  { id: '11', description: 'Internet', value: 120, date: '2025-09-15', category: 'Fixo' },
  { id: '12', description: 'Compras do mês', value: 650, date: '2025-09-20', category: 'Geral' },
  // Agosto 2025
  { id: '13', description: 'Aluguel', value: 1500, date: '2025-08-05', category: 'Fixo' },
  { id: '14', description: 'Conta de luz', value: 220, date: '2025-08-10', category: 'Fixo' },
  { id: '15', description: 'Conta de água', value: 85, date: '2025-08-12', category: 'Fixo' },
  { id: '16', description: 'Internet', value: 120, date: '2025-08-15', category: 'Fixo' },
  { id: '17', description: 'Compras do mês', value: 700, date: '2025-08-18', category: 'Geral' },
  // Julho 2025
  { id: '18', description: 'Aluguel', value: 1500, date: '2025-07-05', category: 'Fixo' },
  { id: '19', description: 'Conta de luz', value: 300, date: '2025-07-10', category: 'Fixo' },
  { id: '20', description: 'Conta de água', value: 90, date: '2025-07-12', category: 'Fixo' },
  { id: '21', description: 'Internet', value: 120, date: '2025-07-15', category: 'Fixo' },
  { id: '22', description: 'Compras do mês', value: 850, date: '2025-07-18', category: 'Geral' },
  // Junho 2025
  { id: '23', description: 'Aluguel', value: 1500, date: '2025-06-05', category: 'Fixo' },
  { id: '24', description: 'Conta de luz', value: 240, date: '2025-06-10', category: 'Fixo' },
  { id: '25', description: 'Conta de água', value: 70, date: '2025-06-12', category: 'Fixo' },
  { id: '26', description: 'Internet', value: 120, date: '2025-06-15', category: 'Fixo' },
  { id: '27', description: 'Compras do mês', value: 600, date: '2025-06-18', category: 'Geral' },
  // Maio 2025
  { id: '28', description: 'Aluguel', value: 1500, date: '2025-05-05', category: 'Fixo' },
  { id: '29', description: 'Conta de luz', value: 230, date: '2025-05-10', category: 'Fixo' },
  { id: '30', description: 'Conta de água', value: 80, date: '2025-05-12', category: 'Fixo' },
  { id: '31', description: 'Internet', value: 120, date: '2025-05-15', category: 'Fixo' },
  { id: '32', description: 'Compras do mês', value: 750, date: '2025-05-18', category: 'Geral' },
];

// ── Itens futuros ─────────────────────────────────────────────────────────────

export const mockFutureItems = [
  { id: '1', name: 'Sofá novo', priority: Priority.MEDIUM, estimatedCost: 'R$ 2.500', estimatedValue: 2500, status: FutureItemStatus.PLANNED },
  { id: '2', name: 'Aspirador de pó', priority: Priority.HIGH, estimatedCost: 'R$ 800', estimatedValue: 800, status: FutureItemStatus.PLANNED },
  { id: '3', name: 'TV 50 polegadas', priority: Priority.LOW, estimatedCost: 'R$ 2.000', estimatedValue: 2000, status: FutureItemStatus.PLANNED },
  { id: '4', name: 'Geladeira nova', priority: Priority.HIGH, estimatedCost: 'R$ 3.500', estimatedValue: 3500, status: FutureItemStatus.PLANNED },
  { id: '5', name: 'Mesa de jantar', priority: Priority.MEDIUM, estimatedCost: 'R$ 1.200', estimatedValue: 1200, status: FutureItemStatus.PLANNED },
] satisfies FutureItem[];
