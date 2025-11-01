/**
 * Definições de tipos para o aplicativo Ninho
 * Este arquivo contém todas as interfaces e tipos de dados usados na aplicação
 */

// ==================== ENUMS ====================

/**
 * Categorias válidas para gastos
 */
export enum ExpenseCategory {
  FIXED = 'Fixo',
  MAINTENANCE = 'Manutenção',
  NEW_ITEM = 'Novo item',
  GENERAL = 'Geral',
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  ENTERTAINMENT = 'Entretenimento',
  OTHER = 'Outro'
}

/**
 * Categorias válidas para itens de compra
 */
export enum ShoppingCategory {
  FOOD = 'Alimentos',
  CLEANING = 'Limpeza',
  HYGIENE = 'Higiene',
  GENERAL = 'Geral',
  OTHER = 'Outro'
}

/**
 * Níveis de prioridade
 */
export enum Priority {
  HIGH = 'alta',
  MEDIUM = 'média',
  LOW = 'baixa'
}

/**
 * IDs dos módulos da aplicação
 */
export enum ModuleId {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  SHOPPING = 'shopping',
  FINANCIAL = 'financial',
  FUTURE = 'future',
  CALENDAR = 'calendar'
}

/**
 * Métodos de pagamento
 */
export enum PaymentMethod {
  CASH = 'Dinheiro',
  DEBIT = 'Débito',
  CREDIT = 'Crédito',
  PIX = 'PIX',
  BOLETO = 'Boleto',
  OTHER = 'Outro'
}

/**
 * Status de pagamento
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid'
}

/**
 * Status de compra futura
 */
export enum FutureItemStatus {
  PLANNED = 'planned',
  PURCHASED = 'purchased'
}

// ==================== INTERFACES ====================

/**
 * Interface para Avisos do quadro
 */
export interface Notice {
  id: string;
  text: string;
  author: string;
  date: string; // ISO format (YYYY-MM-DD)
  createdAt?: Date;
}

/**
 * Interface para Tarefas
 */
export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  dueDate: string; // ISO format (YYYY-MM-DD)
  description?: string;
  priority?: Priority;
  category?: string;
  createdAt?: Date;
}

/**
 * Interface para Item de Compra
 */
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string; // ex: "5kg", "3un"
  checked: boolean;
  category: string;
  month: string; // Mês de referência
  price?: number;
  monthYear?: string; // 'YYYY-MM'
}

/**
 * Interface para Lista de Compras Mensal
 */
export interface ShoppingList {
  id: string;
  month: string; // 'YYYY-MM'
  items: ShoppingItem[];
  createdAt: Date;
  archived?: boolean;
}

/**
 * Interface para Informações de Parcelamento
 */
export interface Installment {
  total: number;
  current: number;
  valuePerInstallment: number;
}

/**
 * Interface para Informações de Pagamento
 */
export interface Payment {
  method: PaymentMethod;
  paidBy: string;
  paidAt: Date;
}

/**
 * Interface para Despesas/Gastos
 */
export interface Expense {
  id: string;
  description: string;
  value: number;
  date: string; // ISO format (YYYY-MM-DD)
  category: string;
  responsible?: string;
  paymentMethod?: PaymentMethod;
  installments?: Installment;
  paymentStatus?: PaymentStatus;
  payment?: Payment;
}

/**
 * Interface para Informações de Compra de Item Futuro
 */
export interface FuturePurchase {
  expenseId: string;
  actualValue: number;
  purchasedAt: Date;
}

/**
 * Interface para Itens de Compras Futuras
 */
export interface FutureItem {
  id: string;
  name: string;
  priority: Priority;
  estimatedCost: string; // ex: "R$ 2.500"
  estimatedValue?: number;
  description?: string;
  category?: string;
  link?: string;
  notes?: string;
  status?: FutureItemStatus;
  purchase?: FuturePurchase;
}

/**
 * Interface para Usuário
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ==================== TYPE ALIASES ====================

/**
 * Tipo para representar uma data em formato ISO
 */
export type ISODate = string;

/**
 * Tipo para representar valores monetários
 */
export type Currency = number;

// ==================== CONSTANTES LEGADAS (para compatibilidade) ====================

/**
 * @deprecated Use o enum ExpenseCategory ao invés
 */
export const ExpenseCategories = {
  FIXED: ExpenseCategory.FIXED,
  MAINTENANCE: ExpenseCategory.MAINTENANCE,
  NEW_ITEM: ExpenseCategory.NEW_ITEM,
  GENERAL: ExpenseCategory.GENERAL
} as const;

/**
 * @deprecated Use o enum ShoppingCategory ao invés
 */
export const ShoppingCategories = {
  FOOD: ShoppingCategory.FOOD,
  CLEANING: ShoppingCategory.CLEANING,
  GENERAL: ShoppingCategory.GENERAL
} as const;

/**
 * @deprecated Use o enum Priority ao invés
 */
export const PriorityLevels = {
  HIGH: Priority.HIGH,
  MEDIUM: Priority.MEDIUM,
  LOW: Priority.LOW
} as const;

/**
 * @deprecated Use o enum ModuleId ao invés
 */
export const ModuleIds = {
  DASHBOARD: ModuleId.DASHBOARD,
  TASKS: ModuleId.TASKS,
  SHOPPING: ModuleId.SHOPPING,
  FINANCIAL: ModuleId.FINANCIAL,
  FUTURE: ModuleId.FUTURE,
  CALENDAR: ModuleId.CALENDAR
} as const;
