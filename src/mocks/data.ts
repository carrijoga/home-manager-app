/**
 * Dados mockados do app Ninho.
 * Usado nos services em DATA_MODE === 'mock'.
 * Cada array usa `satisfies` para garantir conformidade com os tipos em build.
 */

import type { AppNotification, AppShoppingCategory, AppShoppingItem, AppShoppingList, AppShoppingListSummary, FutureItem, Notice, Task } from '@/types';
import { FutureItemStatus, Priority } from '@/types';

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

export const mockNotices = [
  { id: '1', text: 'Lembrete: Reunião de condomínio sexta-feira às 19h', author: 'João', date: '2025-10-28' },
  { id: '2', text: 'Encanador virá terça-feira para verificar o chuveiro', author: 'Maria', date: '2025-10-29' },
  { id: '3', text: 'Lembrar de pagar a conta de água até dia 15', author: 'Pedro', date: '2025-10-27' },
] satisfies Notice[];

// ── Tarefas ───────────────────────────────────────────────────────────────────

export const mockTasks = [
  // Novembro 2025
  { id: '1', title: 'Limpar a geladeira', assignedTo: 'Maria', completed: false, dueDate: '2025-11-02' },
  { id: '2', title: 'Levar o lixo para fora', assignedTo: 'João', completed: false, dueDate: '2025-11-03' },
  { id: '4', title: 'Limpar o banheiro', assignedTo: 'Pedro', completed: false, dueDate: '2025-11-01' },
  { id: '5', title: 'Organizar a despensa', assignedTo: 'Maria', completed: false, dueDate: '2025-11-05' },
  // Outubro 2025
  { id: '3', title: 'Pagar conta de luz', assignedTo: 'Geral', completed: true, dueDate: '2025-10-28' },
  { id: '6', title: 'Trocar lâmpada da sala', assignedTo: 'João', completed: true, dueDate: '2025-10-20' },
  { id: '7', title: 'Fazer compras do mês', assignedTo: 'Maria', completed: true, dueDate: '2025-10-15' },
  { id: '8', title: 'Limpar quintal', assignedTo: 'Pedro', completed: false, dueDate: '2025-10-25' },
  // Setembro 2025
  { id: '9', title: 'Organizar guarda-roupa', assignedTo: 'Maria', completed: true, dueDate: '2025-09-20' },
  { id: '10', title: 'Pagar condomínio', assignedTo: 'Geral', completed: true, dueDate: '2025-09-10' },
  { id: '11', title: 'Limpar cozinha', assignedTo: 'João', completed: true, dueDate: '2025-09-15' },
] satisfies Task[];

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
