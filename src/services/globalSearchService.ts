import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  CheckSquare,
  CreditCard,
  DollarSign,
  Home,
  RefreshCw,
  Settings,
  ShoppingCart,
  TrendingUp,
  User,
} from 'lucide-react';

import * as calendarService from '@/services/calendarService';
import * as financialService from '@/services/financialService';
import * as noticeService from '@/services/noticeService';
import * as shoppingService from '@/services/shoppingService';
import * as taskService from '@/services/taskService';

export interface SearchResultItem {
  id: string;
  type: 'navigation' | 'task' | 'shopping' | 'financial' | 'calendar' | 'notice';
  group: 'Páginas & Ações' | 'Tarefas' | 'Lista de Compras' | 'Financeiro' | 'Agenda' | 'Avisos';
  title: string;
  subtitle?: string;
  badge?: string;
  icon: LucideIcon;
  path?: string;
  actionId?: 'openProfile' | 'openSettings' | 'openNestManager';
}

export const NAVIGATION_ITEMS: SearchResultItem[] = [
  {
    id: 'nav-dashboard',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Início',
    subtitle: 'Painel principal com visão geral',
    icon: Home,
    path: '/dashboard',
  },
  {
    id: 'nav-tasks',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Tarefas',
    subtitle: 'Quadro Kanban e lista de tarefas',
    icon: CheckSquare,
    path: '/tasks',
  },
  {
    id: 'nav-shopping',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Lista de Compras',
    subtitle: 'Planejamento e itens de mercado',
    icon: ShoppingCart,
    path: '/shopping',
  },
  {
    id: 'nav-financial',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Financeiro — Lançamentos',
    subtitle: 'Entradas, saídas e controle financeiro',
    icon: DollarSign,
    path: '/financial',
  },
  {
    id: 'nav-financial-goals',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Financeiro — Metas',
    subtitle: 'Metas e economias da família',
    icon: TrendingUp,
    path: '/financial/goals',
  },
  {
    id: 'nav-financial-recurrences',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Financeiro — Recorrências',
    subtitle: 'Despesas e receitas recorrentes',
    icon: RefreshCw,
    path: '/financial/recurrences',
  },
  {
    id: 'nav-financial-account',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Financeiro — Contas Bancárias',
    subtitle: 'Saldos e extrato de contas',
    icon: User,
    path: '/financial/account',
  },
  {
    id: 'nav-financial-card',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Financeiro — Cartões de Crédito',
    subtitle: 'Faturas e limite de cartões',
    icon: CreditCard,
    path: '/financial/card',
  },
  {
    id: 'nav-calendar',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Agenda / Calendário',
    subtitle: 'Compromissos e eventos',
    icon: CalendarDays,
    path: '/calendar',
  },
  {
    id: 'action-profile',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Meu Perfil',
    subtitle: 'Editar informações pessoais e avatar',
    icon: User,
    actionId: 'openProfile',
  },
  {
    id: 'action-settings',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Configurações do Sistema',
    subtitle: 'Aparência, preferências e notificações',
    icon: Settings,
    actionId: 'openSettings',
  },
  {
    id: 'action-nest-manager',
    type: 'navigation',
    group: 'Páginas & Ações',
    title: 'Gerenciar Ninho (Família)',
    subtitle: 'Membros, convites e ninhos ativados',
    icon: Home,
    actionId: 'openNestManager',
  },
];

/**
 * Realiza a busca unificada em todos os módulos da aplicação
 */
export async function searchAll(
  rawQuery: string,
  nestId?: string | null
): Promise<SearchResultItem[]> {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  // 1. Filtrar navegação rápida
  const navResults = NAVIGATION_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query))
  );

  const results: SearchResultItem[] = [...navResults];

  // Executar buscas assíncronas em paralelo
  const [tasksRes, shoppingRes, financialRes, calendarRes, noticesRes] = await Promise.allSettled([
    taskService.getActiveTasks(1, 50, nestId ?? undefined),
    shoppingService.getShoppingLists(undefined, nestId ?? undefined),
    financialService.listTransactions({ pageSize: 100 }, nestId ?? undefined),
    calendarService.getUpcomingEvents(20),
    noticeService.getActiveNotices(nestId ?? undefined),
  ]);

  // 2. Tarefas
  if (tasksRes.status === 'fulfilled' && tasksRes.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawVal = tasksRes.value as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskItems: any[] = Array.isArray(rawVal)
      ? rawVal
      : Array.isArray(rawVal?.items)
        ? rawVal.items
        : [];

    const matchedTasks = taskItems
      .filter(
        (t) =>
          (t.title && String(t.title).toLowerCase().includes(query)) ||
          (t.description && String(t.description).toLowerCase().includes(query)) ||
          (t.categoryLabel && String(t.categoryLabel).toLowerCase().includes(query))
      )
      .slice(0, 5);

    matchedTasks.forEach((t) => {
      results.push({
        id: `task-${t.taskId}`,
        type: 'task',
        group: 'Tarefas',
        title: t.title,
        subtitle: t.description || `Categoria: ${t.categoryLabel || 'Geral'}`,
        badge: t.isCompleted ? 'Concluída' : t.priorityLabel || 'Pendente',
        icon: CheckSquare,
        path: '/tasks',
      });
    });
  }

  // 3. Lista de Compras & Itens
  if (shoppingRes.status === 'fulfilled' && shoppingRes.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawVal = shoppingRes.value as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lists: any[] = Array.isArray(rawVal)
      ? rawVal
      : Array.isArray(rawVal?.items)
        ? rawVal.items
        : [];

    // Busca por nome da lista
    const matchedLists = lists.filter(
      (list) => list.name && String(list.name).toLowerCase().includes(query)
    );

    matchedLists.forEach((list) => {
      results.push({
        id: `shopping-list-${list.shoppingListId}`,
        type: 'shopping',
        group: 'Lista de Compras',
        title: list.name,
        subtitle: `${list.totalItems ?? 0} itens • ${list.monthYear || 'Lista de compras'}`,
        badge: list.isFinished ? 'Finalizada' : 'Em andamento',
        icon: ShoppingCart,
        path: '/shopping',
      });
    });

    // Buscar itens dentro das listas ativas (primeiras 5 listas)
    const listDetailPromises = lists
      .slice(0, 5)
      .map((l) => shoppingService.getShoppingListById(l.shoppingListId, nestId ?? undefined));

    const listDetailsRes = await Promise.allSettled(listDetailPromises);
    listDetailsRes.forEach((res) => {
      if (res.status === 'fulfilled' && res.value?.items) {
        const detail = res.value;
        const matchedItems = detail.items.filter(
          (item) => item.name && String(item.name).toLowerCase().includes(query)
        );

        matchedItems.slice(0, 5).forEach((item) => {
          results.push({
            id: `shopping-item-${item.shoppingItemId}`,
            type: 'shopping',
            group: 'Lista de Compras',
            title: item.name,
            subtitle: `Na lista "${detail.name}"${item.categoryName ? ` • ${item.categoryName}` : ''}`,
            badge: item.isPurchased ? 'Comprado' : 'Pendente',
            icon: ShoppingCart,
            path: '/shopping',
          });
        });
      }
    });
  }

  // 4. Lançamentos Financeiros
  if (financialRes.status === 'fulfilled' && financialRes.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawVal = financialRes.value as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txs: any[] = Array.isArray(rawVal)
      ? rawVal
      : Array.isArray(rawVal?.items)
        ? rawVal.items
        : [];

    const matchedTxs = txs
      .filter(
        (t) =>
          (t.description && String(t.description).toLowerCase().includes(query)) ||
          (t.notes && String(t.notes).toLowerCase().includes(query)) ||
          (t.categoryName && String(t.categoryName).toLowerCase().includes(query)) ||
          (t.value != null && String(t.value).includes(query))
      )
      .slice(0, 5);

    matchedTxs.forEach((t) => {
      const isExpense = Number(t.transactionType) === 0;
      const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(t.value ?? 0));

      results.push({
        id: `financial-${t.financialTransactionId}`,
        type: 'financial',
        group: 'Financeiro',
        title: t.description,
        subtitle: `Valor: ${formattedValue}${t.categoryName ? ` • ${t.categoryName}` : ''}`,
        badge: isExpense ? 'Despesa' : 'Receita',
        icon: DollarSign,
        path: '/financial',
      });
    });
  }

  // 5. Agenda / Eventos
  if (calendarRes.status === 'fulfilled' && calendarRes.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawVal = calendarRes.value as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: any[] = Array.isArray(rawVal) ? rawVal : [];
    const matchedEvents = events
      .filter(
        (e) =>
          (e.title && String(e.title).toLowerCase().includes(query)) ||
          (e.location && String(e.location).toLowerCase().includes(query))
      )
      .slice(0, 4);

    matchedEvents.forEach((e) => {
      const dateStr = new Date(e.startsAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      results.push({
        id: `calendar-${e.id}`,
        type: 'calendar',
        group: 'Agenda',
        title: e.title,
        subtitle: `${dateStr}${e.location ? ` • ${e.location}` : ''}`,
        icon: CalendarDays,
        path: '/calendar',
      });
    });
  }

  // 6. Avisos
  if (noticesRes.status === 'fulfilled' && noticesRes.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawVal = noticesRes.value as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notices: any[] = Array.isArray(rawVal) ? rawVal : [];
    const matchedNotices = notices
      .filter((n) => n.message && String(n.message).toLowerCase().includes(query))
      .slice(0, 4);

    matchedNotices.forEach((n) => {
      results.push({
        id: `notice-${n.noticeId}`,
        type: 'notice',
        group: 'Avisos',
        title: n.message,
        subtitle: `Publicado em ${new Date(n.createdAt).toLocaleDateString('pt-BR')}`,
        badge: n.isPinned ? 'Fixado' : undefined,
        icon: Home,
        path: '/dashboard',
      });
    });
  }

  return results;
}
