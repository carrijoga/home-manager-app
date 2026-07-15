/**
 * Serviço para gerenciar transações financeiras.
 * Em modo API usa os endpoints reais: POST /create, POST /list, GET /get-by-id.
 * Em modo mock usa dados locais de `mocks/data.ts`.
 */

import type {
  AddPaymentRequest,
  CreateTransactionRequest,
  DeleteTransactionRequest,
  FinancialTransactionDashboardResponse,
  FinancialTransactionFilter,
  FinancialTransactionListResponse,
  FinancialTransactionResponse,
  RemovePaymentRequest,
  UpdateTransactionRequest,
} from '@/schemas/financial';
import {
  FinancialTransactionDashboardResponseSchema,
  FinancialTransactionListResponseSchema,
  FinancialTransactionResponseSchema,
} from '@/schemas/financial';

import { mockExpenses, mockFinancialCategories, mockTransactions } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

// Tipo do mock — mantido para os stubs legados addExpense/deleteExpense
type MockExpense = (typeof mockExpenses)[number];

function safeParse<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } } },
  raw: unknown,
  name: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn(`[financialService] ${name}: schema inesperado`, result.error?.flatten());
    }
    return raw as T;
  }
  return result.data!;
}

// ── Mock store (mutável para simular mutações em modo mock) ──────────────────

let mockStore: FinancialTransactionResponse[] = mockTransactions.map(t => ({
  ...t,
  payments: [...t.payments],
}));

const delay = <T,>(value: T, ms = 100): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(value), ms));

function getPaidSum(t: FinancialTransactionResponse): number {
  return t.payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
}

/** Data local em YYYY-MM-DD — evita off-by-one perto da meia-noite em UTC-3. */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function recomputeStatus(t: FinancialTransactionResponse): FinancialTransactionResponse {
  const isPaid = getPaidSum(t) >= Number(t.value);
  const due = t.dueDate ? String(t.dueDate).slice(0, 10) : null;
  return { ...t, isPaid, isOverdue: !isPaid && due !== null && due < localToday() };
}

function applyMockFilter(
  items: FinancialTransactionResponse[],
  filter?: FinancialTransactionFilter,
): FinancialTransactionResponse[] {
  if (!filter) return items;
  if (
    import.meta.env.DEV &&
    (filter.ids?.length || filter.minValue != null || filter.maxValue != null ||
      filter.responsibleUserIds?.length || filter.origins?.length ||
      filter.sourceTypes?.length || filter.sourceIds?.length)
  ) {
    console.warn('[financialService] applyMockFilter: ids/min-maxValue/responsibleUserIds/origins/sourceTypes/sourceIds não implementados em modo mock');
  }
  return items.filter(t => {
    if (filter.types?.length && !filter.types.includes(t.transactionType)) return false;
    if (filter.description && !t.description.toLowerCase().includes(filter.description.toLowerCase())) return false;
    if (filter.categoryIds?.length && !filter.categoryIds.includes(t.categoryId)) return false;
    if (filter.isPaid != null && t.isPaid !== filter.isPaid) return false;
    if (filter.isOverdue != null && t.isOverdue !== filter.isOverdue) return false;
    const txDate = String(t.transactionDate).slice(0, 10);
    if (filter.minTransactionDate && txDate < filter.minTransactionDate) return false;
    if (filter.maxTransactionDate && txDate > filter.maxTransactionDate) return false;
    const due = t.dueDate ? String(t.dueDate).slice(0, 10) : null;
    if (filter.minDueDate && (!due || due < filter.minDueDate)) return false;
    if (filter.maxDueDate && (!due || due > filter.maxDueDate)) return false;
    return true;
  });
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function listTransactions(
  filter?: FinancialTransactionFilter,
  nestId?: string,
): Promise<FinancialTransactionListResponse> {
  if (DATA_MODE === 'mock') {
    const filtered = applyMockFilter(mockStore, filter).sort((a, b) =>
      String(b.transactionDate).localeCompare(String(a.transactionDate)),
    );
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? filtered.length;
    return delay({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalCount: filtered.length,
    });
  }

  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.list, filter ?? {}, { nestId });
  return safeParse(FinancialTransactionListResponseSchema, raw, 'listTransactions');
}

export async function getTransactionById(id: string, nestId?: string): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    const found = mockStore.find(t => t.financialTransactionId === id);
    if (!found) throw new Error(`Transação ${id} não encontrada`);
    // Cópia: nunca devolver referência viva do store
    return delay({ ...found, payments: [...found.payments] });
  }

  const raw = await httpClient.get<unknown>(`${ENDPOINTS.financial.getById}?id=${id}`, nestId);
  return safeParse(FinancialTransactionResponseSchema, raw, 'getTransactionById');
}

export async function getFinancialDashboard(
  month: number,
  year: number,
  nestId?: string,
): Promise<FinancialTransactionDashboardResponse> {
  if (DATA_MODE === 'mock') {
    const inMonth = mockStore.filter(t => {
      const d = new Date(String(t.transactionDate));
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    const prevMonthNum = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const inPrev = mockStore.filter(t => {
      const d = new Date(String(t.transactionDate));
      return d.getMonth() + 1 === prevMonthNum && d.getFullYear() === prevYear;
    });

    // transactionType: 0 = Expense, 1 = Income
    const sumIncome = (list: FinancialTransactionResponse[]) =>
      list.filter(t => t.transactionType === 1).reduce((s, t) => s + Number(t.value), 0);
    const sumExpenses = (list: FinancialTransactionResponse[]) =>
      list.filter(t => t.transactionType === 0).reduce((s, t) => s + Number(t.value), 0);

    const curIncome = sumIncome(inMonth);
    const curExpenses = sumExpenses(inMonth);
    const prevExpenses = sumExpenses(inPrev);

    const today = new Date().toISOString().slice(0, 10);
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    const limitIso = limit.toISOString().slice(0, 10);

    const upcomingBills = inMonth
      .filter(
        t =>
          t.transactionType === 0 &&
          !t.isPaid &&
          t.dueDate !== null &&
          String(t.dueDate).slice(0, 10) <= limitIso,
      )
      .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
      .map(t => ({
        financialTransactionId: t.financialTransactionId,
        description: t.description,
        value: Number(t.value),
        dueDate: t.dueDate,
        isOverdue: t.dueDate !== null && String(t.dueDate).slice(0, 10) < today,
      }));

    const categoryTotals: Record<string, { categoryId: string; totalAmount: number }> = {};
    inMonth
      .filter(t => t.transactionType === 0)
      .forEach(t => {
        const key = t.categoryName || 'Outros';
        if (!categoryTotals[key]) categoryTotals[key] = { categoryId: t.categoryId, totalAmount: 0 };
        categoryTotals[key].totalAmount += Number(t.value);
      });
    const expensesByCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
      .map(([categoryName, { categoryId, totalAmount }]) => ({ categoryId, categoryName, totalAmount }));

    const balanceVariationPercent =
      prevExpenses > 0 ? Math.round(((curExpenses - prevExpenses) / prevExpenses) * 100) : 0;

    return delay({
      currentMonth: { totalIncome: curIncome, totalExpenses: curExpenses, balance: curIncome - curExpenses },
      previousMonth: {
        totalIncome: sumIncome(inPrev),
        totalExpenses: prevExpenses,
        balance: sumIncome(inPrev) - prevExpenses,
      },
      balanceVariationPercent,
      upcomingBills,
      expensesByCategory,
    });
  }

  const path = `${ENDPOINTS.financial.dashboard}?month=${month}&year=${year}`;
  const raw = await httpClient.get<unknown>(path, nestId);
  return safeParse(FinancialTransactionDashboardResponseSchema, raw, 'getFinancialDashboard');
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createTransaction(
  payload: CreateTransactionRequest,
  nestId?: string,
): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    const category = mockFinancialCategories.find(c => c.categoryId === payload.categoryId);
    const created = recomputeStatus({
      financialTransactionId: crypto.randomUUID(),
      nestId: nestId ?? 'nest-mock-0001',
      transactionType: payload.type,
      description: payload.description,
      value: Number(payload.amount),
      transactionDate: payload.transactionDate,
      dueDate: payload.dueDate ?? null,
      responsibleUserId: payload.responsibleUserId,
      responsibleUserName: 'João (Você)',
      categoryId: payload.categoryId,
      categoryName: category?.name ?? 'Geral',
      origin: 0,
      originName: 'Financeiro',
      incomeOrigin: payload.incomeOrigin ?? null,
      observation: null,
      sourceType: payload.sourceType,
      sourceId: payload.sourceId ?? crypto.randomUUID(),
      sourceName: null,
      payments: [],
      isPaid: false,
      isOverdue: false,
    });
    mockStore = [created, ...mockStore];
    return delay(created);
  }

  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.create, payload, { nestId });
  return safeParse(FinancialTransactionResponseSchema, raw, 'createTransaction');
}

export async function updateTransaction(
  payload: UpdateTransactionRequest,
  nestId?: string,
): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    const idx = mockStore.findIndex(t => t.financialTransactionId === payload.financialTransactionId);
    if (idx === -1) throw new Error('Transação não encontrada');
    const category = mockFinancialCategories.find(c => c.categoryId === payload.categoryId);
    const updated = recomputeStatus({
      ...mockStore[idx],
      transactionType: payload.type,
      description: payload.description,
      value: Number(payload.amount),
      transactionDate: payload.transactionDate,
      dueDate: payload.dueDate ?? null,
      categoryId: payload.categoryId,
      categoryName: category?.name ?? mockStore[idx].categoryName,
      responsibleUserId: payload.responsibleUserId,
      sourceType: payload.sourceType,
      sourceId: payload.sourceId ?? mockStore[idx].sourceId,
      incomeOrigin: payload.incomeOrigin ?? mockStore[idx].incomeOrigin,
      observation: payload.observation ?? mockStore[idx].observation,
    });
    mockStore = mockStore.map((t, i) => (i === idx ? updated : t));
    return delay(updated);
  }

  // Endpoint planejado — backend ainda vai expor (ver endpoints.ts)
  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.update, payload, { nestId });
  return safeParse(FinancialTransactionResponseSchema, raw, 'updateTransaction');
}

export async function deleteTransaction(payload: DeleteTransactionRequest, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    mockStore = mockStore.filter(t => t.financialTransactionId !== payload.financialTransactionId);
    return delay(undefined);
  }

  // Endpoint planejado — backend ainda vai expor (ver endpoints.ts)
  await httpClient.post<unknown>(ENDPOINTS.financial.delete, payload, { nestId });
}

export async function addPayment(payload: AddPaymentRequest, nestId?: string): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    const idx = mockStore.findIndex(t => t.financialTransactionId === payload.transactionId);
    if (idx === -1) throw new Error('Transação não encontrada');
    const tx = mockStore[idx];
    const payment = {
      financialTransactionPaymentId: crypto.randomUUID(),
      financialTransactionId: tx.financialTransactionId,
      nestId: tx.nestId,
      amount: Number(payload.amount),
      discount: Number(payload.discount ?? 0),
      interest: Number(payload.interest ?? 0),
      method: payload.method,
      methodName: null,
      paymentDate: payload.paymentDate,
      paidByUserId: payload.paidByUserId,
      paidByUserFullName: 'João (Você)',
      observation: payload.observation ?? null,
    };
    const updated = recomputeStatus({ ...tx, payments: [...tx.payments, payment] });
    mockStore = mockStore.map((t, i) => (i === idx ? updated : t));
    return delay(updated);
  }

  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.addPayment, payload, { nestId });
  return safeParse(FinancialTransactionResponseSchema, raw, 'addPayment');
}

export async function removePayment(payload: RemovePaymentRequest, nestId?: string): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    const idx = mockStore.findIndex(t => t.financialTransactionId === payload.financialTransactionId);
    if (idx === -1) throw new Error('Transação não encontrada');
    const tx = mockStore[idx];
    const updated = recomputeStatus({
      ...tx,
      payments: tx.payments.filter(p => p.financialTransactionPaymentId !== payload.paymentId),
    });
    mockStore = mockStore.map((t, i) => (i === idx ? updated : t));
    return delay(updated);
  }

  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.removePayment, payload, { nestId });
  return safeParse(FinancialTransactionResponseSchema, raw, 'removePayment');
}

// ── Helpers locais (não dependem de API) ──────────────────────────────────────

export function calculateExpenseStats(expenses: { value: number; category?: string }[]) {
  const total = expenses.reduce((sum, e) => sum + (e.value ?? 0), 0);

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    const cat = e.category ?? 'Outro';
    acc[cat] = (acc[cat] ?? 0) + (e.value ?? 0);
    return acc;
  }, {});

  return {
    total,
    average: expenses.length > 0 ? total / expenses.length : 0,
    byCategory,
    count: expenses.length,
    categories: Object.keys(byCategory).length,
  };
}

// ── Alias legado (para compatibilidade com componentes existentes) ─────────────

/** @deprecated Use `listTransactions` — mantido para o AppContext/Dashboard (shape antigo). */
export async function getAllExpenses() {
  if (DATA_MODE === 'mock') {
    return delay(mockExpenses);
  }
  const result = await listTransactions();
  return result.items;
}

/** @deprecated Use `createTransaction` */
export async function addExpense(expense: Partial<CreateTransactionRequest> & { description: string; value?: number }) {
  if (DATA_MODE === 'mock') {
    const mock: MockExpense = {
      id: crypto.randomUUID(),
      description: expense.description,
      value: expense.value ?? 0,
      date: new Date().toISOString().split('T')[0],
      category: 'Geral',
    };
    return new Promise<MockExpense>((resolve) => setTimeout(() => resolve(mock), 100));
  }
  throw new Error('[financialService] Use createTransaction em modo API.');
}

/** @deprecated */
export async function deleteExpense(_id: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(), 100));
  }
  throw new Error('[financialService] deleteExpense não disponível em modo API.');
}
