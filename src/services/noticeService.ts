/**
 * Serviço para gerenciar o Quadro de Avisos.
 * Suporta API real e modo mock (DATA_MODE === 'mock').
 */

import type { CreateNoticeRequest, UpdateNoticeRequest } from '@/schemas/notices';
import { NoticeHistoryResponseSchema, NoticeResponseSchema } from '@/schemas/notices';
import type { Notice, NoticeReaction, PaginatedResponse } from '@/types';
import { ApiPriority } from '@/types';

import { MOCK_USER_ID, mockNotices } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Verifica se a data de criação de um recado pertence a dias anteriores a hoje.
 */
export function isCreatedInPastDays(dateStr?: string): boolean {
  if (!dateStr) return false;
  const createdDate = new Date(dateStr);
  if (Number.isNaN(createdDate.getTime())) return false;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return createdDate.getTime() < startOfToday;
}

/**
 * Ordena os avisos conforme requisitos:
 * 1° Pinned notas primeiro
 * 2° Prioridade (Urgente = 0, Alta = 1, Media = 2, Baixa = 3)
 * 3° Data de criação mais recente primeiro
 */
export function sortNotices(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    // 1° Fixadas primeiro
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    // 2° Prioridade (menor número = maior prioridade)
    const prioA = a.priority ?? ApiPriority.Baixa;
    const prioB = b.priority ?? ApiPriority.Baixa;
    if (prioA !== prioB) {
      return prioA - prioB;
    }
    // 3° Data de criação mais recente
    const timeA = new Date(a.createdAt || a.date || 0).getTime();
    const timeB = new Date(b.createdAt || b.date || 0).getTime();
    return timeB - timeA;
  });
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function apiToNotice(raw: unknown): Notice {
  const normalizeReactions = (value: unknown): NoticeReaction[] => {
    if (!Array.isArray(value)) return [];
    const list: NoticeReaction[] = [];
    for (const item of value) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      const emoji = typeof rec.emoji === 'string' ? rec.emoji : '';
      if (!emoji) continue;
      list.push({
        reactionId: String(rec.reactionId ?? rec.noticeReactionId ?? crypto.randomUUID()),
        noticeId: String(rec.noticeId ?? ''),
        userId: String(rec.userId ?? ''),
        userName:
          typeof rec.userName === 'string'
            ? rec.userName
            : undefined,
        userAvatar:
          typeof rec.userProfilePictureUrl === 'string'
            ? rec.userProfilePictureUrl
            : typeof rec.userAvatar === 'string'
              ? rec.userAvatar
              : typeof rec.authorAvatar === 'string'
                ? rec.authorAvatar
                : undefined,
        emoji,
        createdAt: String(rec.createdAt ?? new Date().toISOString()),
      });
    }
    return list;
  };

  const parsed = NoticeResponseSchema.safeParse(raw);
  if (parsed.success) {
    const r = raw as Record<string, unknown>;
    return {
      noticeId: parsed.data.noticeId,
      message: parsed.data.message,
      date: parsed.data.date,
      isPinned: parsed.data.isPinned,
      priority: (parsed.data.priority as ApiPriority) ?? ApiPriority.Baixa,
      expiresAt: parsed.data.expiresAt,
      isActive: parsed.data.isActive,
      createdBy: parsed.data.createdBy,
      createdAt: parsed.data.createdAt,
      authorName:
        parsed.data.createdByName ??
        parsed.data.authorName ??
        (r.createdByName as string) ??
        (r.authorName as string) ??
        undefined,
      authorAvatar:
        parsed.data.createdByProfilePictureUrl ??
        parsed.data.authorAvatar ??
        (r.createdByProfilePictureUrl as string) ??
        (r.authorAvatar as string) ??
        undefined,
      color: (r.color as string) ?? undefined,
      reactions: normalizeReactions(parsed.data.reactions),
    };
  }

  // Fallback permissivo
  const r = raw as Record<string, unknown>;
  return {
    noticeId: String(r.noticeId ?? ''),
    message: String(r.message ?? ''),
    date: String(r.date ?? ''),
    isPinned: Boolean(r.isPinned ?? false),
    priority: (r.priority as ApiPriority) ?? ApiPriority.Baixa,
    expiresAt: (r.expiresAt as string) ?? null,
    isActive: Boolean(r.isActive ?? true),
    createdBy: String(r.createdBy ?? ''),
    createdAt: String(r.createdAt ?? ''),
    authorName:
      (r.createdByName as string) ?? (r.authorName as string) ?? undefined,
    authorAvatar:
      (r.createdByProfilePictureUrl as string) ?? (r.authorAvatar as string) ?? undefined,
    color: (r.color as string) ?? undefined,
    reactions: normalizeReactions(r.reactions),
  };
}

// ── Mock state ────────────────────────────────────────────────────────────────

const _mockState = [...mockNotices];

// ── API ───────────────────────────────────────────────────────────────────────

export async function getActiveNotices(nestId?: string): Promise<Notice[]> {
  if (DATA_MODE === 'mock') {
    const active = _mockState.filter(
      (n) => n.isActive !== false && (n.isPinned || !isCreatedInPastDays(n.createdAt))
    );
    return new Promise((resolve) => setTimeout(() => resolve(sortNotices(active)), 100));
  }
  const data = await httpClient.get<unknown[]>(ENDPOINTS.notices.list, nestId);
  const list = (Array.isArray(data) ? data : []).map(apiToNotice);
  const active = list.filter(
    (n) => n.isActive !== false && (n.isPinned || !isCreatedInPastDays(n.createdAt))
  );
  return sortNotices(active);
}

export async function createNotice(
  payload: CreateNoticeRequest,
  nestId?: string,
  currentUser?: { id: string; name: string; avatar?: string }
): Promise<Notice> {
  if (DATA_MODE === 'mock') {
    const now = new Date().toISOString();
    const notice: Notice = {
      noticeId: crypto.randomUUID(),
      message: payload.message,
      date: payload.date ?? now,
      isPinned: false,
      priority: (payload.priority as ApiPriority) ?? ApiPriority.Baixa,
      expiresAt: payload.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      createdBy: currentUser?.id ?? MOCK_USER_ID,
      createdAt: now,
      authorName: currentUser?.name ?? 'Você',
      authorAvatar:
        currentUser?.avatar ??
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      reactions: [],
    };
    _mockState.unshift(notice);
    return new Promise((resolve) => setTimeout(() => resolve(notice), 100));
  }

  const id = await httpClient.post<string>(ENDPOINTS.notices.create, payload, { nestId });
  // Busca o aviso criado pelo ID retornado ou recarrega a lista
  const data = await httpClient.get<unknown>(ENDPOINTS.notices.list, nestId);
  const list = Array.isArray(data) ? data : [];
  const created = list.find((n: unknown) => (n as Record<string, unknown>).noticeId === id);
  return created
    ? apiToNotice(created)
    : {
        noticeId: id,
        message: payload.message,
        date: payload.date ?? new Date().toISOString(),
        isPinned: false,
        priority: (payload.priority as ApiPriority) ?? ApiPriority.Baixa,
        expiresAt: payload.expiresAt ?? null,
        isActive: true,
        createdBy: currentUser?.id ?? '',
        createdAt: new Date().toISOString(),
        authorName: currentUser?.name,
        authorAvatar: currentUser?.avatar,
        reactions: [],
      };
}

export async function updateNotice(
  id: string,
  payload: UpdateNoticeRequest,
  nestId?: string
): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex((n) => n.noticeId === id);
    if (idx >= 0) {
      _mockState[idx] = {
        ..._mockState[idx],
        message: payload.message,
        priority:
          payload.priority !== undefined
            ? (payload.priority as ApiPriority)
            : _mockState[idx].priority,
        expiresAt: payload.expiresAt ?? _mockState[idx].expiresAt,
      };
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.put<void>(ENDPOINTS.notices.update(id), payload, nestId);
}

export async function deleteNotice(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex((n) => n.noticeId === id);
    if (idx >= 0) _mockState.splice(idx, 1);
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.del<void>(ENDPOINTS.notices.delete(id), nestId);
}

export async function pinNotice(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const notice = _mockState.find((n) => n.noticeId === id);
    if (notice) {
      notice.isPinned = true;
      notice.expiresAt = null;
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.patch<void>(ENDPOINTS.notices.pin(id), undefined, nestId);
}

export async function unpinNotice(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const notice = _mockState.find((n) => n.noticeId === id);
    if (notice) {
      notice.isPinned = false;
      notice.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.patch<void>(ENDPOINTS.notices.unpin(id), undefined, nestId);
}

export async function getNoticeHistory(
  page = 1,
  pageSize = 20,
  nestId?: string
): Promise<PaginatedResponse<Notice>> {
  if (DATA_MODE === 'mock') {
    // Notas inativas ou notas de dias passados que não estão fixadas
    const expired = _mockState.filter(
      (n) => !n.isPinned && (n.isActive === false || isCreatedInPastDays(n.createdAt))
    );
    const start = (page - 1) * pageSize;
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            items: expired.slice(start, start + pageSize),
            totalCount: expired.length,
            page,
            pageSize,
          }),
        100
      )
    );
  }
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const data = await httpClient.get<unknown>(`${ENDPOINTS.notices.history}?${params}`, nestId);
  const parsed = NoticeHistoryResponseSchema.safeParse(data);
  if (parsed.success) {
    const items = parsed.data.items
      .map(apiToNotice)
      .filter((n) => !n.isPinned && (n.isActive === false || isCreatedInPastDays(n.createdAt)));
    return { ...parsed.data, items, totalCount: items.length };
  }
  return { items: [], totalCount: 0, page, pageSize };
}

export async function reactToNotice(
  id: string,
  reaction: string,
  nestId?: string,
  currentUser?: { id: string; name: string; avatar?: string }
): Promise<void> {
  if (DATA_MODE === 'mock') {
    const notice = _mockState.find((n) => n.noticeId === id);
    if (notice) {
      notice.reactions = notice.reactions ?? [];
      const userId = currentUser?.id ?? MOCK_USER_ID;
      const existingIdx = notice.reactions.findIndex(
        (r) => r.userId === userId && r.emoji === reaction
      );
      if (existingIdx >= 0) {
        notice.reactions.splice(existingIdx, 1);
      } else {
        notice.reactions.push({
          reactionId: crypto.randomUUID(),
          noticeId: id,
          userId,
          userName: currentUser?.name ?? 'Você',
          userAvatar:
            currentUser?.avatar ??
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          emoji: reaction,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.patch<void>(ENDPOINTS.notices.reaction(id), { reaction }, nestId);
}

export async function unreactToNotice(
  id: string,
  reactionId: string,
  nestId?: string
): Promise<void> {
  if (DATA_MODE === 'mock') {
    const notice = _mockState.find((n) => n.noticeId === id);
    if (notice?.reactions) {
      notice.reactions = notice.reactions.filter((r) => r.reactionId !== reactionId);
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.patch<void>(ENDPOINTS.notices.unreaction(id), { reactionId }, nestId);
}

// Compat alias mantido para o AppContext legado
/** @deprecated use getActiveNotices */
export const getAllNotices = getActiveNotices;
