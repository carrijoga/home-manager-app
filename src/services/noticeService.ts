/**
 * Serviço para gerenciar o Quadro de Avisos.
 * Suporta API real e modo mock (DATA_MODE === 'mock').
 */

import type { Notice, PaginatedResponse } from '@/types';
import { ApiPriority } from '@/types';
import type { CreateNoticeRequest, UpdateNoticeRequest } from '@/schemas/notices';
import { NoticeResponseSchema, NoticeHistoryResponseSchema } from '@/schemas/notices';
import { mockNotices } from '../mocks/data';
import { httpClient } from './api/httpClient';
import { ENDPOINTS } from './api/endpoints';
import { DATA_MODE } from './api/config';

// ── Mappers ───────────────────────────────────────────────────────────────────

function apiToNotice(raw: unknown): Notice {
  const normalizeReactions = (value: unknown): Notice['reactions'] => {
    if (!Array.isArray(value)) return undefined;
    return value
      .map((r) => {
        const rec = r as Record<string, unknown>;
        const emoji = typeof rec.emoji === 'string' ? rec.emoji : '';
        const count = Number(rec.count ?? 0);
        if (!emoji || Number.isNaN(count)) return null;
        return { emoji, count };
      })
      .filter((r): r is { emoji: string; count: number } => r !== null);
  };

  const parsed = NoticeResponseSchema.safeParse(raw);
  if (parsed.success) {
    const r = raw as Record<string, unknown>;
    return {
      ...parsed.data as Notice,
      color: (r.color as string) ?? undefined,
      reactions: normalizeReactions(r.reactions),
    };
  }
  // fallback permissivo
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
    color: (r.color as string) ?? undefined,
    reactions: normalizeReactions(r.reactions),
  };
}

// ── Mock state ────────────────────────────────────────────────────────────────

const _mockState = [...mockNotices];

// ── API ───────────────────────────────────────────────────────────────────────

export async function getActiveNotices(nestId?: string): Promise<Notice[]> {
  if (DATA_MODE === 'mock') {
    return new Promise(resolve =>
      setTimeout(() => resolve(_mockState.filter(n => n.isActive).sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })), 100)
    );
  }
  const data = await httpClient.get<unknown[]>(ENDPOINTS.notices.list, nestId);
  return (Array.isArray(data) ? data : []).map(apiToNotice);
}

export async function createNotice(payload: CreateNoticeRequest, nestId?: string): Promise<Notice> {
  if (DATA_MODE === 'mock') {
    const now = new Date().toISOString();
    const notice: Notice = {
      noticeId: crypto.randomUUID(),
      message: payload.message,
      date: payload.date ?? now,
      isPinned: false,
      priority: ApiPriority.Baixa,
      expiresAt: payload.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      createdBy: 'user-mock-0001',
      createdAt: now,
      authorName: 'Você',
      color: payload.color,
    };
    _mockState.unshift(notice);
    return new Promise(resolve => setTimeout(() => resolve(notice), 100));
  }
  const id = await httpClient.post<string>(ENDPOINTS.notices.create, payload, { nestId });
  // Busca o aviso criado pelo ID retornado
  const data = await httpClient.get<unknown>(ENDPOINTS.notices.list, nestId);
  const list = Array.isArray(data) ? data : [];
  const created = list.find((n: unknown) => (n as Record<string, unknown>).noticeId === id);
  return created ? apiToNotice(created) : { noticeId: id, message: payload.message, date: payload.date ?? new Date().toISOString(), isPinned: false, priority: ApiPriority.Baixa, expiresAt: payload.expiresAt ?? null, isActive: true, createdBy: '', createdAt: new Date().toISOString() };
}

export async function updateNotice(id: string, payload: UpdateNoticeRequest, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex(n => n.noticeId === id);
    if (idx >= 0) {
      _mockState[idx] = { ..._mockState[idx], message: payload.message, expiresAt: payload.expiresAt ?? _mockState[idx].expiresAt };
    }
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  await httpClient.put<void>(ENDPOINTS.notices.update(id), payload, nestId);
}

export async function deleteNotice(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex(n => n.noticeId === id);
    if (idx >= 0) _mockState.splice(idx, 1);
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  await httpClient.del<void>(ENDPOINTS.notices.delete(id), nestId);
}

export async function pinNotice(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const notice = _mockState.find(n => n.noticeId === id);
    if (notice) { notice.isPinned = true; notice.expiresAt = null; }
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  await httpClient.patch<void>(ENDPOINTS.notices.pin(id), undefined, nestId);
}

export async function unpinNotice(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const notice = _mockState.find(n => n.noticeId === id);
    if (notice) {
      notice.isPinned = false;
      notice.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  await httpClient.patch<void>(ENDPOINTS.notices.unpin(id), undefined, nestId);
}

export async function getNoticeHistory(page = 1, pageSize = 20, nestId?: string): Promise<PaginatedResponse<Notice>> {
  if (DATA_MODE === 'mock') {
    const expired = _mockState.filter(n => !n.isActive);
    const start = (page - 1) * pageSize;
    return new Promise(resolve =>
      setTimeout(() => resolve({
        items: expired.slice(start, start + pageSize),
        totalCount: expired.length,
        page,
        pageSize,
      }), 100)
    );
  }
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const data = await httpClient.get<unknown>(`${ENDPOINTS.notices.history}?${params}`, nestId);
  const parsed = NoticeHistoryResponseSchema.safeParse(data);
  if (parsed.success) {
    return { ...parsed.data, items: parsed.data.items.map(apiToNotice) };
  }
  return { items: [], totalCount: 0, page, pageSize };
}

// Compat alias mantido para o AppContext legado
/** @deprecated use getActiveNotices */
export const getAllNotices = getActiveNotices;
