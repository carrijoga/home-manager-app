import type { AppNotification } from '@/types';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

/** Mock local de notificações robustas */
let mockNotifications: AppNotification[] = [
  {
    notificationId: 'notif-1',
    title: 'Fatura Fechada • Nubank',
    message: 'A fatura do seu cartão Nubank Ultravioleta fechou no valor de R$ 1.845,20 com vencimento em 5 dias.',
    type: 1, // Warning
    module: 'financial',
    isRead: false,
    isEnabled: true,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    actions: [
      {
        id: 'act-pay',
        label: 'Pagar Fatura Agora',
        variant: 'primary',
        actionType: 'navigate',
        url: '/financial/card',
      },
      {
        id: 'act-details',
        label: 'Ver Extrato',
        variant: 'secondary',
        actionType: 'navigate',
        url: '/financial/card',
      },
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'fatura_nubank_set2026.pdf',
        url: '#',
        size: '342 KB',
        fileType: 'pdf',
      },
    ],
  },
  {
    notificationId: 'notif-2',
    title: 'Lista de Supermercado Finalizada',
    message: 'Mariana finalizou as compras da lista "Feira e Hortifruti" e anexou a nota fiscal para conferência.',
    type: 3, // Success
    module: 'shopping',
    isRead: false,
    isEnabled: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    actions: [
      {
        id: 'act-shopping',
        label: 'Abrir Lista de Compras',
        variant: 'secondary',
        actionType: 'navigate',
        url: '/shopping',
      },
    ],
    attachments: [
      {
        id: 'att-2',
        name: 'danfe_mercado_1209.pdf',
        url: '#',
        size: '185 KB',
        fileType: 'pdf',
      },
      {
        id: 'att-3',
        name: 'foto_produtos.jpg',
        url: '#',
        size: '1.2 MB',
        fileType: 'image',
      },
    ],
  },
  {
    notificationId: 'notif-3',
    title: 'Tarefa Atribuída • Regar o Jardim',
    message: 'Gabriel atribuiu a tarefa "Regar as plantas e trocar água dos pets" para você com prioridade alta até às 18:00.',
    type: 0, // Info
    module: 'tasks',
    isRead: false,
    isEnabled: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actions: [
      {
        id: 'act-task-done',
        label: 'Concluir Tarefa',
        variant: 'primary',
        actionType: 'complete_task',
      },
      {
        id: 'act-task-view',
        label: 'Ver no Painel',
        variant: 'secondary',
        actionType: 'navigate',
        url: '/tasks',
      },
    ],
  },
  {
    notificationId: 'notif-4',
    title: 'Recado de Domingo • Mural',
    message: 'Lembrando que domingo faremos o almoço de família às 12:30. Tragam sobremesa e venham com roupa confortável!',
    type: 0, // Info
    module: 'system',
    isRead: false,
    isEnabled: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: {
      name: 'Mariana',
    },
  },
  {
    notificationId: 'notif-5',
    title: 'Salário Depositado • Conta Itaú',
    message: 'Crédito de R$ 7.200,00 identificado na sua conta principal Itaú.',
    type: 3, // Success
    module: 'financial',
    isRead: true,
    isEnabled: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actions: [
      {
        id: 'act-account',
        label: 'Ver Saldo',
        variant: 'secondary',
        actionType: 'navigate',
        url: '/financial/account',
      },
    ],
  },
  {
    notificationId: 'notif-6',
    title: 'Aniversário da Vovó neste Sábado',
    message: 'Evento agendado no calendário familiar para o dia 14/09 às 15:00.',
    type: 1, // Warning
    module: 'calendar',
    isRead: true,
    isEnabled: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    actions: [
      {
        id: 'act-cal',
        label: 'Ver Calendário',
        variant: 'secondary',
        actionType: 'navigate',
        url: '/calendar',
      },
    ],
  },
];

/** Mapeia item vindo da API para AppNotification */
function mapApiNotification(item: Record<string, unknown>): AppNotification {
  let typeNumber = 0;
  const rawType = item.type ?? item.Type;

  if (typeof rawType === 'number') {
    typeNumber = rawType;
  } else if (typeof rawType === 'string') {
    const lower = rawType.toLowerCase();
    if (lower === 'info') typeNumber = 0;
    else if (lower === 'warning') typeNumber = 1;
    else if (lower === 'error') typeNumber = 2;
    else if (lower === 'success') typeNumber = 3;
    else typeNumber = Number(rawType) || 0;
  }

  return {
    notificationId: String(item.notificationId ?? item.NotificationId ?? item.id ?? ''),
    title: String(item.title ?? item.Title ?? 'Notificação'),
    message: String(item.message ?? item.Message ?? ''),
    type: typeNumber,
    isRead: Boolean(item.isRead ?? item.IsRead ?? false),
    isEnabled: Boolean(item.isEnabled ?? item.IsEnabled ?? true),
    createdAt: (item.createdAt ?? item.CreatedAt ?? item.timestamp ?? new Date().toISOString()) as string,
    module: (item.module ?? item.Module) as AppNotification['module'],
    actions: (item.actions ?? item.Actions) as AppNotification['actions'],
    attachments: (item.attachments ?? item.Attachments) as AppNotification['attachments'],
    author: (item.author ?? item.Author) as AppNotification['author'],
  };
}

/**
 * Busca todas as notificações do usuário autenticado.
 * GET /api/users/me/notification
 */
export async function getNotifications(): Promise<AppNotification[]> {
  if (DATA_MODE === 'mock') {
    return [...mockNotifications];
  }

  const rawList = await httpClient.get<unknown[]>(ENDPOINTS.users.meNotifications);
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map((item) => mapApiNotification(item as Record<string, unknown>));
}

/**
 * Marca uma notificação como lida.
 * PUT /api/users/me/notification/{notificationId}/read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    mockNotifications = mockNotifications.map((n) =>
      n.notificationId === notificationId ? { ...n, isRead: true } : n
    );
    return;
  }

  await httpClient.put<void>(ENDPOINTS.users.markNotificationAsRead(notificationId));
}

/**
 * Exclui uma notificação.
 * DELETE /api/users/me/notification/{notificationId}
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    mockNotifications = mockNotifications.filter((n) => n.notificationId !== notificationId);
    return;
  }

  await httpClient.del<void>(ENDPOINTS.users.deleteNotification(notificationId));
}
