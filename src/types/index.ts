/**
 * Tipos internos do app Ninho (frontend-only).
 * Para tipos derivados da API, use `src/schemas/`.
 */

// ==================== ENUMS ====================

/** Níveis de prioridade — usados em Task e FutureItem */
export enum Priority {
  HIGH = 'alta',
  MEDIUM = 'média',
  LOW = 'baixa',
}

/** IDs dos módulos da aplicação */
export enum ModuleId {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  SHOPPING = 'shopping',
  FINANCIAL = 'financial',
  FUTURE = 'future',
  CALENDAR = 'calendar',
}

/** Categorias para itens de compra (módulo Shopping, mock-only) */
export enum ShoppingCategory {
  FOOD = 'Alimentos',
  CLEANING = 'Limpeza',
  HYGIENE = 'Higiene',
  GENERAL = 'Geral',
  OTHER = 'Outro',
}

/**
 * Status de item de compra futura.
 * Não confundir com PaymentStatus da API.
 */
export enum FutureItemStatus {
  PLANNED = 'planned',
  PURCHASED = 'purchased',
}

/**
 * Métodos de pagamento no formato do app (strings em PT-BR).
 * Para o enum numérico da API use `ApiPaymentMethod` em `src/schemas/enums`.
 */
export enum AppPaymentMethod {
  CASH = 'Dinheiro',
  DEBIT = 'Débito',
  CREDIT = 'Crédito',
  PIX = 'PIX',
  BOLETO = 'Boleto',
  OTHER = 'Outro',
}

// ==================== INTERFACES ====================

/** Ninho associado ao usuário (derivado de UserNestResponse da API) */
export interface AppUserNest {
  nestId: string;
  name: string;
  icon?: string | null;
  isDefault: boolean;
  role: number;
}

/** Notificação do usuário (derivado de UserNotificationResponse da API) */
export interface AppNotification {
  notificationId: string;
  title: string;
  message: string;
  type: number; // NotificationType: 0=Info, 1=Warning, 2=Error, 3=Success
  isRead: boolean;
  isEnabled: boolean;
}

/** Representação interna do usuário autenticado */
export interface AppUser {
  id: string;
  name: string;
  callmeby: string;
  email: string;
  avatar?: string;
  nests?: AppUserNest[];
  notifications?: AppNotification[];
}

/** Aviso do quadro (módulo Notices, mock-only por enquanto) */
export interface Notice {
  id: string;
  text: string;
  author: string;
  date: string; // ISO format YYYY-MM-DD
  createdAt?: string;
}

/** Tarefa (módulo Tasks, mock-only por enquanto) */
export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  dueDate: string; // ISO format YYYY-MM-DD
  description?: string;
  priority?: Priority;
  category?: string;
  createdAt?: string;
}

/** Item da lista de compras */
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string; // ex: '5kg', '3un'
  checked: boolean;
  category: string;
  month: string; // YYYY-MM
  price?: number;
}

/** Lista de compras mensal */
export interface ShoppingList {
  id: string;
  month: string; // YYYY-MM
  items: ShoppingItem[];
  createdAt: string;
  archived?: boolean;
}

/** Informações de compra de item futuro */
export interface FuturePurchase {
  expenseId: string;
  actualValue: number;
  purchasedAt: string;
}

/** Item de compra futura (módulo FutureItems, mock-only por enquanto) */
export interface FutureItem {
  id: string;
  name: string;
  priority: Priority;
  estimatedCost: string; // ex: 'R$ 2.500'
  estimatedValue?: number;
  description?: string;
  category?: string;
  link?: string;
  notes?: string;
  status?: FutureItemStatus;
  purchase?: FuturePurchase;
}

// ==================== HELPERS ====================

/**
 * Converte UserProfileResponse da API para AppUser interno.
 * O parâmetro aceita o shape do UserProfileResponse de `src/schemas/user`.
 */
export function userProfileToAppUser(profile: {
  userId: string;
  firstName: string;
  lastName: string;
  callbyName: string;
  email: string;
  profilePictureUrl?: string | null;
  nests?: Array<{
    nestId: string;
    name: string;
    icon?: string | null;
    isDefault: boolean;
    role: number;
  }>;
  profile?: {
    notifications?: Array<{
      notificationId: string;
      title: string;
      message: string;
      type: number;
      isRead: boolean;
      isEnabled: boolean;
    }>;
  } | null;
}): AppUser {
  return {
    id: profile.userId,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    callmeby: profile.callbyName,
    email: profile.email,
    avatar: profile.profilePictureUrl ?? undefined,
    nests: (profile.nests ?? []).map(n => ({
      nestId: n.nestId,
      name: n.name,
      icon: n.icon,
      isDefault: n.isDefault,
      role: n.role,
    })),
    notifications: (profile.profile?.notifications ?? []).map(n => ({
      notificationId: n.notificationId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      isEnabled: n.isEnabled,
    })),
  };
}

// ==================== CONSTANTES LEGADAS ====================

/** @deprecated Use enum Priority */
export const PriorityLevels = {
  HIGH: Priority.HIGH,
  MEDIUM: Priority.MEDIUM,
  LOW: Priority.LOW,
} as const;

/** @deprecated Use enum ModuleId */
export const ModuleIds = {
  DASHBOARD: ModuleId.DASHBOARD,
  TASKS: ModuleId.TASKS,
  SHOPPING: ModuleId.SHOPPING,
  FINANCIAL: ModuleId.FINANCIAL,
  FUTURE: ModuleId.FUTURE,
  CALENDAR: ModuleId.CALENDAR,
} as const;
