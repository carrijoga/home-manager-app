import { mockCreditCardInvoices,mockCreditCards } from '@/mocks/data';
import type {
  CreateCreditCardRequest,
  CreditCardInvoice,
  CreditCardResponse,
  UpdateCreditCardRequest,
} from '@/schemas/credit-card';
import { CreditCardResponseSchema } from '@/schemas/credit-card';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 100));

function safeParse<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } } },
  raw: unknown,
  name: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn(`[creditCardService] ${name}: schema inesperado`, result.error?.flatten());
    }
    return raw as T;
  }
  return result.data!;
}

/** Lista os cartões de crédito do nest */
export async function listCreditCards(nestId?: string): Promise<CreditCardResponse[]> {
  if (DATA_MODE === 'mock') {
    return delay([...mockCreditCards]);
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.creditCards.list, nestId);
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => safeParse(CreditCardResponseSchema, c, 'listCreditCards'));
}

/** Busca um cartão pelo ID */
export async function getCreditCardById(id: string, nestId?: string): Promise<CreditCardResponse> {
  if (DATA_MODE === 'mock') {
    const found = mockCreditCards.find((c) => c.creditCardId === id) ?? mockCreditCards[0];
    return delay({ ...found });
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.creditCards.getById(id), nestId);
  return safeParse(CreditCardResponseSchema, raw, 'getCreditCardById');
}

/** Cria um novo cartão. Retorna o uuid criado. */
export async function createCreditCard(payload: CreateCreditCardRequest, nestId?: string): Promise<string> {
  if (DATA_MODE === 'mock') {
    return delay(`card-mock-${Date.now()}`);
  }
  return httpClient.post<string>(ENDPOINTS.creditCards.create, payload, { nestId });
}

/** Atualiza um cartão existente */
export async function updateCreditCard(
  id: string,
  payload: UpdateCreditCardRequest,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.put<unknown>(ENDPOINTS.creditCards.update(id), payload, nestId);
}

/** Inativa um cartão */
export async function inactivateCreditCard(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.del<unknown>(ENDPOINTS.creditCards.inactivate(id), nestId);
}

/** Reativa um cartão inativado */
export async function activateCreditCard(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.patch<unknown>(ENDPOINTS.creditCards.activate(id), undefined, nestId);
}

/**
 * MOCK-ONLY: fatura do cartão. Não há endpoint de API ainda.
 * Quando o back-end existir, adicionar o ramo `api` aqui.
 */
export async function getCreditCardInvoice(cardId: string): Promise<CreditCardInvoice | null> {
  const invoice = mockCreditCardInvoices[cardId] ?? null;
  return delay(invoice);
}
