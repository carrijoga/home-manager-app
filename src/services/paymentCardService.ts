import { mockPaymentCardInvoices, mockPaymentCards } from '@/mocks/data';
import type {
  CreatePaymentCardRequest,
  PaymentCardInvoice,
  PaymentCardResponse,
  UpdateCreditPaymentCardSettingsRequest,
  UpdatePaymentCardDetailsRequest,
} from '@/schemas/payment-card';
import { PaymentCardResponseSchema } from '@/schemas/payment-card';

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
      console.warn(`[paymentCardService] ${name}: schema inesperado`, result.error?.flatten());
    }
    return raw as T;
  }
  return result.data!;
}

/** Lista os cartões de pagamento do nest */
export async function listPaymentCards(nestId?: string): Promise<PaymentCardResponse[]> {
  if (DATA_MODE === 'mock') {
    return delay([...mockPaymentCards]);
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.paymentCards.list, nestId);
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => safeParse(PaymentCardResponseSchema, c, 'listPaymentCards'));
}

/** Busca um cartão pelo ID */
export async function getPaymentCardById(id: string, nestId?: string): Promise<PaymentCardResponse> {
  if (DATA_MODE === 'mock') {
    const found = mockPaymentCards.find((c) => c.paymentCardId === id) ?? mockPaymentCards[0];
    return delay({ ...found });
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.paymentCards.getById(id), nestId);
  return safeParse(PaymentCardResponseSchema, raw, 'getPaymentCardById');
}

/** Cria um novo cartão. Retorna o uuid criado. */
export async function createPaymentCard(
  payload: CreatePaymentCardRequest,
  nestId?: string,
): Promise<string> {
  if (DATA_MODE === 'mock') {
    return delay(`card-mock-${Date.now()}`);
  }
  return httpClient.post<string>(ENDPOINTS.paymentCards.create, payload, { nestId });
}

/** Atualiza nome/cor de qualquer tipo de cartão */
export async function updatePaymentCardDetails(
  id: string,
  payload: UpdatePaymentCardDetailsRequest,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.put<unknown>(ENDPOINTS.paymentCards.updateDetails(id), payload, nestId);
}

/** Atualiza limite/dias — somente cartões do tipo Credit */
export async function updateCreditPaymentCardSettings(
  id: string,
  payload: UpdateCreditPaymentCardSettingsRequest,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.put<unknown>(ENDPOINTS.paymentCards.updateCreditSettings(id), payload, nestId);
}

/** Inativa um cartão */
export async function inactivatePaymentCard(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.del<unknown>(ENDPOINTS.paymentCards.inactivate(id), nestId);
}

/** Reativa um cartão inativado */
export async function activatePaymentCard(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.patch<unknown>(ENDPOINTS.paymentCards.activate(id), undefined, nestId);
}

/**
 * MOCK-ONLY: fatura do cartão. Não há endpoint de API ainda.
 * Quando o back-end existir, adicionar o ramo `api` aqui.
 */
export async function getPaymentCardInvoice(cardId: string): Promise<PaymentCardInvoice | null> {
  const invoice = mockPaymentCardInvoices[cardId] ?? null;
  return delay(invoice);
}
