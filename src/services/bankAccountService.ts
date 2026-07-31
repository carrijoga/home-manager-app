import { mockBankAccountLinkedCounts, mockBankAccounts } from '@/mocks/data';
import type {
  BankAccountResponse,
  CanDeleteBankAccountResponse,
  CreateBankAccountRequest,
  InactivateBankAccountResponse,
  UpdateBankAccountRequest,
} from '@/schemas/bank-account';
import {
  BankAccountResponseSchema,
  CanDeleteBankAccountResponseSchema,
  InactivateBankAccountResponseSchema,
} from '@/schemas/bank-account';

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
      console.warn(`[bankAccountService] ${name}: schema inesperado`, result.error?.flatten());
    }
    return raw as T;
  }
  return result.data!;
}

/** Lista todas as contas bancárias do nest */
export async function listBankAccounts(nestId?: string): Promise<BankAccountResponse[]> {
  if (DATA_MODE === 'mock') {
    return delay([...mockBankAccounts]);
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.bankAccounts.list, nestId);
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => safeParse(BankAccountResponseSchema, a, 'listBankAccounts'));
}

/** Busca uma conta bancária pelo ID */
export async function getBankAccountById(id: string, nestId?: string): Promise<BankAccountResponse> {
  if (DATA_MODE === 'mock') {
    const found = mockBankAccounts.find((a) => a.bankAccountId === id) ?? mockBankAccounts[0];
    return delay({ ...found });
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.bankAccounts.getById(id), nestId);
  return safeParse(BankAccountResponseSchema, raw, 'getBankAccountById');
}

/** Cria uma nova conta bancária. Retorna o uuid criado. */
export async function createBankAccount(payload: CreateBankAccountRequest, nestId?: string): Promise<string> {
  if (DATA_MODE === 'mock') {
    return delay(`account-mock-${Date.now()}`);
  }
  return httpClient.post<string>(ENDPOINTS.bankAccounts.create, payload, { nestId });
}

/** Atualiza nome e cor de uma conta bancária */
export async function updateBankAccount(
  id: string,
  payload: UpdateBankAccountRequest,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.put<unknown>(ENDPOINTS.bankAccounts.update(id), payload, nestId);
}

/** Verifica se a conta pode ser excluída (e quantas transações estão vinculadas) */
export async function canDeleteBankAccount(
  id: string,
  nestId?: string,
): Promise<CanDeleteBankAccountResponse> {
  if (DATA_MODE === 'mock') {
    const count = mockBankAccountLinkedCounts[id] ?? 0;
    return delay({ canDelete: count === 0, linkedTransactionsCount: count });
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.bankAccounts.canDelete(id), nestId);
  return safeParse(CanDeleteBankAccountResponseSchema, raw, 'canDeleteBankAccount');
}

/**
 * Exclui uma conta. Permitido somente se a conta e nenhum cartão vinculado
 * tiverem lançamentos. Bloqueado com 400 caso contrário — a UI deve
 * prevenir isso desabilitando o botão via canDeleteBankAccount antes.
 */
export async function deleteBankAccount(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.del<unknown>(ENDPOINTS.bankAccounts.delete(id), nestId);
}

/** Inativa a conta; cascade automático inativa todos os cartões vinculados. */
export async function inactivateBankAccount(
  id: string,
  nestId?: string,
): Promise<InactivateBankAccountResponse> {
  if (DATA_MODE === 'mock') {
    const account = mockBankAccounts.find((a) => a.bankAccountId === id);
    const count = account?.paymentCards.length ?? 0;
    return delay({ affectedPaymentCardsCount: count });
  }
  const raw = await httpClient.patch<unknown>(ENDPOINTS.bankAccounts.inactivate(id), undefined, nestId);
  return safeParse(InactivateBankAccountResponseSchema, raw, 'inactivateBankAccount');
}

/** Reativa uma conta previamente inativada. */
export async function activateBankAccount(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(null);
    return;
  }
  await httpClient.patch<unknown>(ENDPOINTS.bankAccounts.activate(id), undefined, nestId);
}
