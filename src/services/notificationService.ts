import type { AppNotification } from '@/types';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

/** Mock local de notificações */
let mockNotifications: AppNotification[] = [
  {
    notificationId: 'notif-1',
    title: 'Bem-vindo ao Ninho!',
    message: 'Seu espaço familiar está configurado e pronto para uso.',
    type: 3, // Success
    isRead: false,
    isEnabled: true,
  },
  {
    notificationId: 'notif-2',
    title: 'Lembrete de Tarefa',
    message: 'Você tem tarefas pendentes para hoje.',
    type: 1, // Warning
    isRead: false,
    isEnabled: true,
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
