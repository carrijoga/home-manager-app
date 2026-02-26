/**
 * Serviço para gerenciar transações financeiras.
 * Em modo API usa os endpoints reais: POST /create, POST /list, GET /get-by-id.
 * Em modo mock usa dados locais de `mocks/data.ts`.
 */

import type {
  AddPaymentRequest,
  CreateTransactionRequest,
  FinancialTransactionFilter,
  FinancialTransactionListResponse,
  FinancialTransactionResponse,
  RemovePaymentRequest,
} from '@/schemas/financial';
import {
  FinancialTransactionListResponseSchema,
  FinancialTransactionResponseSchema,
} from '@/schemas/financial';
import { DATA_MODE } from './api/config';
import { httpClient } from './api/httpClient';
import { ENDPOINTS } from './api/endpoints';
import { mockExpenses } from '../mocks/data';

// Tipo do mock — mapeado para FinancialTransactionResponse quando possível
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

// ── Queries ───────────────────────────────────────────────────────────────────

export async function listTransactions(
  filter?: FinancialTransactionFilter,
  nestId?: string,
): Promise<FinancialTransactionListResponse> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            items: mockExpenses as unknown as FinancialTransactionResponse[],
            page: 1,
            pageSize: mockExpenses.length,
            totalCount: mockExpenses.length,
          }),
        100,
      ),
    );
  }

  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.list, filter ?? {}, { nestId });
  return safeParse(FinancialTransactionListResponseSchema, raw, 'listTransactions');
}

export async function getTransactionById(id: string, nestId?: string): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    const found = mockExpenses.find((e) => String(e.id) === id);
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (found) resolve(found as unknown as FinancialTransactionResponse);
        else reject(new Error(`Transação ${id} não encontrada`));
      }, 100),
    );
  }

  const raw = await httpClient.get<unknown>(`${ENDPOINTS.financial.getById}?id=${id}`, nestId);
  return safeParse(FinancialTransactionResponseSchema, raw, 'getTransactionById');
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createTransaction(
  payload: CreateTransactionRequest,
  nestId?: string,
): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    const mock: MockExpense = {
      id: crypto.randomUUID(),
      description: payload.description,
      value: payload.amount as unknown as number,
      date: payload.transactionDate,
      category: 'Geral',
    };
    return new Promise((resolve) =>
      setTimeout(() => resolve(mock as unknown as FinancialTransactionResponse), 100),
    );
  }

  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.create, payload, { nestId });
  return safeParse(FinancialTransactionResponseSchema, raw, 'createTransaction');
}

export async function addPayment(payload: AddPaymentRequest, nestId?: string): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ financialTransactionId: payload.transactionId } as unknown as FinancialTransactionResponse), 100),
    );
  }

  const raw = await httpClient.post<unknown>(ENDPOINTS.financial.addPayment, payload, { nestId });
  return safeParse(FinancialTransactionResponseSchema, raw, 'addPayment');
}

export async function removePayment(payload: RemovePaymentRequest, nestId?: string): Promise<FinancialTransactionResponse> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ financialTransactionId: payload.financialTransactionId } as unknown as FinancialTransactionResponse), 100),
    );
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

/** @deprecated Use `listTransactions` */
export async function getAllExpenses() {
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
