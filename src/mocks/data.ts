/**
 * Dados mockados do app Ninho.
 * Usado nos services em DATA_MODE === 'mock'.
 * Cada array usa `satisfies` para garantir conformidade com os tipos em build.
 */

import type { AppNotification, FutureItem, Notice, ShoppingItem, ShoppingList, Task } from '@/types';
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

// ── Lista de compras ──────────────────────────────────────────────────────────

const mockShoppingItems = [
  { id: '1', name: 'Arroz', quantity: '5kg', checked: false, category: 'Alimentos', month: '2025-10', price: 30 },
  { id: '2', name: 'Feijão', quantity: '2kg', checked: false, category: 'Alimentos', month: '2025-10', price: 15 },
  { id: '3', name: 'Detergente', quantity: '3un', checked: true, category: 'Limpeza', month: '2025-10', price: 9 },
  { id: '4', name: 'Sabão em pó', quantity: '2un', checked: false, category: 'Limpeza', month: '2025-10', price: 25 },
  { id: '5', name: 'Macarrão', quantity: '3 pacotes', checked: false, category: 'Alimentos', month: '2025-10', price: 12 },
  { id: '6', name: 'Papel higiênico', quantity: '12un', checked: false, category: 'Limpeza', month: '2025-10', price: 35 },
  { id: '7', name: 'Café', quantity: '500g', checked: true, category: 'Alimentos', month: '2025-10', price: 18 },
  { id: '8', name: 'Açúcar', quantity: '1kg', checked: false, category: 'Alimentos', month: '2025-10', price: 5 },
] satisfies ShoppingItem[];

export const mockShoppingList = {
  id: 'mock-list-1',
  month: '2025-10',
  items: mockShoppingItems,
  createdAt: '2025-10-01T00:00:00.000Z',
} satisfies ShoppingList;

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
