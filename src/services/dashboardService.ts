import { DashboardResponseSchema } from '@/schemas/dashboard';
import type { DashboardResponse } from '@/schemas/dashboard';

import { mockNotices, mockTasks, mockShoppingLists, mockExpenses } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function buildMockDashboard(): DashboardResponse {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth();

  // Financial
  const currentMonthExpenses = mockExpenses?.filter(e => {
    const d = new Date(e.date ?? '');
    return d.getFullYear() === yr && d.getMonth() === mo;
  }) ?? [];
  const prevMonthExpenses = mockExpenses?.filter(e => {
    const d = new Date(e.date ?? '');
    const prevMo = mo === 0 ? 11 : mo - 1;
    const prevYr = mo === 0 ? yr - 1 : yr;
    return d.getFullYear() === prevYr && d.getMonth() === prevMo;
  }) ?? [];
  const totalMonthSpent = currentMonthExpenses.reduce((s, e) => s + Number(e.value ?? 0), 0);
  const totalLastMonthSpent = prevMonthExpenses.reduce((s, e) => s + Number(e.value ?? 0), 0);
  const monthVariation = totalLastMonthSpent > 0
    ? Math.round(((totalMonthSpent - totalLastMonthSpent) / totalLastMonthSpent) * 100)
    : 0;

  // Shopping
  const currentLists = mockShoppingLists?.filter(l => {
    const d = new Date(l.monthYear ?? '');
    return d.getFullYear() === yr && d.getMonth() === mo;
  }) ?? [];
  const totalMonthItems = currentLists.reduce((s, l) => s + (l.totalItems ?? 0), 0);
  const totalMonthEstimatedValue = currentLists.reduce((s, l) => s + (l.totalEstimated ?? 0), 0);

  // Tasks
  const todayStart = new Date(yr, mo, now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const dayTasks = mockTasks.filter(t => {
    const d = new Date(t.dueDate ?? t.date ?? '').getTime();
    return d >= todayStart && d < todayEnd;
  });
  const totalDayTasks = dayTasks.length || mockTasks.length;
  const totalDayFinishedTasks = dayTasks.filter(t => t.isCompleted).length || mockTasks.filter(t => t.isCompleted).length;
  const rateTasks = totalDayTasks > 0 ? Math.round((totalDayFinishedTasks / totalDayTasks) * 100) : 0;

  // Events (mock — no calendar mock data, use empty)
  const activeNotices = mockNotices.filter(n => n.isActive).slice(0, 6);

  return {
    financial: { totalMonthSpent, totalLastMonthSpent, monthVariation },
    shoppingList: { totalMonthItems, totalMonthEstimatedValue },
    task: { totalDayTasks, totalDayFinishedTasks, rateTasks },
    event: { totalWeekEvents: 0, nextEventDate: null, nextEventName: '' },
    notices: activeNotices.map(n => ({
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

export async function getDashboard(nestId?: string): Promise<DashboardResponse> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return buildMockDashboard();
  }

  try {
    const raw = await httpClient.get<unknown>(ENDPOINTS.dashboard.summary, nestId);
    const parsed = DashboardResponseSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    throw new ApiError('Resposta inesperada do servidor ao carregar o dashboard.');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Não foi possível carregar o dashboard.');
  }
}
