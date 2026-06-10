/**
 * Tipos internos do app Ninho (frontend-only).
 * Para tipos derivados da API, use `src/schemas/`.
 */

// ==================== ENUMS ====================

/** Níveis de prioridade — usados em Task e FutureItem (legado) */
export enum Priority {
  HIGH = 'alta',
  MEDIUM = 'média',
  LOW = 'baixa',
}

/** Prioridade de tarefa — enum numérico conforme API */
export enum ApiPriority {
  Urgente = 0,
  Alta = 1,
  Media = 2,
  Baixa = 3,
}

/** Categoria de tarefa — enum numérico conforme API */
export enum ApiCategory {
  Geral = 0,
  Limpeza = 1,
  Manutencao = 2,
  Financas = 3,
  Outros = 4,
}

/** Status de tarefa no board (client-side — o backend usa isCompleted) */
export enum TaskStatus {
  AFazer = 0,
  EmAndamento = 1,
  Concluido = 2,
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.AFazer]: 'A Fazer',
  [TaskStatus.EmAndamento]: 'Em Andamento',
  [TaskStatus.Concluido]: 'Concluído',
};

/** IDs dos módulos da aplicação */
export enum ModuleId {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  SHOPPING = 'shopping',
  FINANCIAL = 'financial',
  FUTURE = 'future',
  CALENDAR = 'calendar',
}

// ShoppingCategory enum removed — categories are now dynamic (from API / mock)

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

/** Clima atual apresentado no dashboard */
export interface AppWeather {
  city: string;
  temperature: number;
  description: string;
  source?: 'gps' | 'ip' | 'manual';
  conditionCode?: string | null;
  observedAt?: string | null;
}

/** Aviso do quadro (módulo Notices) */
export interface Notice {
  noticeId: string;
  message: string;
  date: string;
  isPinned: boolean;
  priority: ApiPriority;
  expiresAt: string | null;
  isActive: boolean;
  createdBy: string; // UUID do autor
  createdAt: string;
  authorName?: string; // nome legível, enriquecido no frontend
  color?: string; // chave de cor do post-it (yellow|pink|green|orange|blue)
  reactions?: Array<{ emoji: string; count: number }>;
}

/** Tarefa (módulo Tasks) */
export interface Task {
  taskId: string;
  title: string;
  description?: string | null;
  details?: string | null;
  assignedTo?: string | null; // UUID do usuário ou null = Geral
  dueDate?: string | null;
  priority: ApiPriority;
  priorityLabel: string;
  category: ApiCategory;
  categoryLabel: string;
  date: string;
  /** Status no board Kanban — derivado de isCompleted na ausência de campo da API */
  status?: TaskStatus;
  isCompleted: boolean;
  completedAt?: string | null;
  isOverdue: boolean;
  createdBy: string;
  createdAt: string;
}

/** Resposta paginada genérica */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Categoria de compra (default do sistema ou personalizada do nest) */
export interface AppShoppingCategory {
  shoppingCategoryId: string;
  nestId: string | null;
  name: string;
  description?: string | null;
  isDefault: boolean;
}

/** Item dentro de uma lista de compras */
export interface AppShoppingItem {
  shoppingItemId: string;
  shoppingListId: string;
  name: string;
  quantity: number;
  unitType: number;
  shoppingCategoryId?: string | null;
  categoryName?: string | null;
  isPurchased: boolean;
  price?: number | null;
  estimatedPrice?: number | null;
  purchasedAt?: string | null;
  notes?: string | null;
}

/** Lista de compras (visão detalhada — inclui itens) */
export interface AppShoppingList {
  shoppingListId: string;
  name: string;
  monthYear: string; // ISO date-time string
  notes?: string | null;
  items: AppShoppingItem[];
}

/** Resumo de lista de compras (visão de listagem — sem itens) */
export interface AppShoppingListSummary {
  shoppingListId: string;
  name: string;
  monthYear: string; // ISO date-time string
  notes?: string | null;
  totalItems: number;
  purchasedItems: number;
  totalEstimated?: number | null;
  totalSpent?: number | null;
  isFinished?: boolean;
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
