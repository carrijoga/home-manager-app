import type { DashboardResponse } from '@/schemas/dashboard';
import { DashboardResponseSchema } from '@/schemas/dashboard';

import { mockExpenses, mockNotices, mockShoppingLists, mockTasks } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildMockDashboard(): DashboardResponse {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth();

  // Financial
  const currentMonthExpenses =
    mockExpenses?.filter((e) => {
      const d = new Date(e.date ?? '');
      return d.getFullYear() === yr && d.getMonth() === mo;
    }) ?? [];
  const prevMonthExpenses =
    mockExpenses?.filter((e) => {
      const d = new Date(e.date ?? '');
      const prevMo = mo === 0 ? 11 : mo - 1;
      const prevYr = mo === 0 ? yr - 1 : yr;
      return d.getFullYear() === prevYr && d.getMonth() === prevMo;
    }) ?? [];
  const totalMonthSpent = currentMonthExpenses.reduce((s, e) => s + Number(e.value ?? 0), 0);
  const totalLastMonthSpent = prevMonthExpenses.reduce((s, e) => s + Number(e.value ?? 0), 0);
  const monthVariation =
    totalLastMonthSpent > 0
      ? Math.round(((totalMonthSpent - totalLastMonthSpent) / totalLastMonthSpent) * 100)
      : 0;

  // Shopping
  const currentLists =
    mockShoppingLists?.filter((l) => {
      const d = new Date(l.monthYear ?? '');
      return d.getFullYear() === yr && d.getMonth() === mo;
    }) ?? [];
  const totalMonthItems = currentLists.reduce((s, l) => s + (l.totalItems ?? 0), 0);
  const totalMonthEstimatedValue = currentLists.reduce((s, l) => s + (l.totalEstimated ?? 0), 0);

  // Tasks
  const todayStart = new Date(yr, mo, now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const dayTasks = mockTasks.filter((t) => {
    const d = new Date(t.dueDate ?? t.date ?? '').getTime();
    return d >= todayStart && d < todayEnd;
  });
  const totalDayTasks = dayTasks.length || mockTasks.length;
  const totalDayFinishedTasks =
    dayTasks.filter((t) => t.isCompleted).length || mockTasks.filter((t) => t.isCompleted).length;
  const rateTasks =
    totalDayTasks > 0 ? Math.round((totalDayFinishedTasks / totalDayTasks) * 100) : 0;

  // Events (mock — no calendar mock data, use empty)
  const activeNotices = mockNotices.filter((n) => n.isActive).slice(0, 6);

  return {
    financial: { totalMonthSpent, totalLastMonthSpent, monthVariation },
    shoppingList: { totalMonthItems, totalMonthEstimatedValue },
    task: { totalDayTasks, totalDayFinishedTasks, rateTasks },
    event: { totalWeekEvents: 0, nextEventDate: null, nextEventName: '' },
    notices: activeNotices.map((n) => ({
      noticeId: n.noticeId,
      message: n.message,
      date: n.date,
      isPinned: n.isPinned,
      expiresAt: n.expiresAt,
      isActive: n.isActive,
      createdBy: n.createdBy,
      createdAt: n.createdAt,
      reactions: [],
    })),
    events: [],
  };
}

function normalizeDashboardResponse(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;

  let obj = raw as Record<string, unknown>;

  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    obj = obj.data as Record<string, unknown>;
  } else if (obj.result && typeof obj.result === 'object' && !Array.isArray(obj.result)) {
    obj = obj.result as Record<string, unknown>;
  } else if (obj.value && typeof obj.value === 'object' && !Array.isArray(obj.value)) {
    obj = obj.value as Record<string, unknown>;
  }

  const normalizeObj = (o: Record<string, unknown>): Record<string, unknown> => {
    const res: Record<string, unknown> = {};
    for (const key of Object.keys(o)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      const val = o[key];
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        res[camelKey] = normalizeObj(val as Record<string, unknown>);
      } else if (Array.isArray(val)) {
        res[camelKey] = val.map((item) =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? normalizeObj(item as Record<string, unknown>)
            : item
        );
      } else {
        res[camelKey] = val;
      }
    }
    return res;
  };

  return normalizeObj(obj);
}

function mergeWithFallback(normalized: unknown): DashboardResponse {
  if (!normalized || typeof normalized !== 'object') return buildMockDashboard();
  const n = normalized as Record<string, Record<string, unknown> | unknown>;
  const financial = (n.financial ?? {}) as Record<string, unknown>;
  const shoppingList = (n.shoppingList ?? {}) as Record<string, unknown>;
  const task = (n.task ?? {}) as Record<string, unknown>;
  const event = (n.event ?? {}) as Record<string, unknown>;

  return {
    financial: {
      totalMonthSpent: Number(financial.totalMonthSpent ?? 0),
      totalLastMonthSpent: Number(financial.totalLastMonthSpent ?? 0),
      monthVariation: Number(financial.monthVariation ?? 0),
    },
    shoppingList: {
      totalMonthItems: Number(shoppingList.totalMonthItems ?? 0),
      totalMonthEstimatedValue: Number(shoppingList.totalMonthEstimatedValue ?? 0),
    },
    task: {
      totalDayTasks: Number(task.totalDayTasks ?? 0),
      totalDayFinishedTasks: Number(task.totalDayFinishedTasks ?? 0),
      rateTasks: Number(task.rateTasks ?? 0),
    },
    event: {
      totalWeekEvents: Number(event.totalWeekEvents ?? 0),
      nextEventDate: (event.nextEventDate as string | null) ?? null,
      nextEventName: (event.nextEventName as string) ?? '',
    },
    notices: Array.isArray(n.notices) ? (n.notices as DashboardResponse['notices']) : [],
    events: Array.isArray(n.events) ? (n.events as DashboardResponse['events']) : [],
  };
}

export async function getDashboard(nestId?: string): Promise<DashboardResponse> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return buildMockDashboard();
  }

  try {
    const raw = await httpClient.get<unknown>(ENDPOINTS.dashboard.summary, nestId);
    const normalized = normalizeDashboardResponse(raw);
    const parsed = DashboardResponseSchema.safeParse(normalized);

    if (!parsed.success) {
      if (import.meta.env.DEV) {
        console.warn('[dashboardService] getDashboard: schema warning', parsed.error?.flatten());
      }
      return mergeWithFallback(normalized);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Não foi possível carregar o dashboard.');
  }
}
