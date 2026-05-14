import type {
  BankAccountResponse,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
} from '@/schemas/bank-account';
import { BankAccountResponseSchema } from '@/schemas/bank-account';

import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

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

/** Busca uma conta bancária pelo ID */
export async function getBankAccountById(id: string, nestId?: string): Promise<BankAccountResponse> {
  const raw = await httpClient.get<unknown>(ENDPOINTS.bankAccounts.getById(id), nestId);
  return safeParse(BankAccountResponseSchema, raw, 'getBankAccountById');
}

/** Cria uma nova conta bancária */
export async function createBankAccount(payload: CreateBankAccountRequest, nestId?: string): Promise<BankAccountResponse> {
  const raw = await httpClient.post<unknown>(ENDPOINTS.bankAccounts.create, payload, { nestId });
  return safeParse(BankAccountResponseSchema, raw, 'createBankAccount');
}

/** Atualiza nome e cor de uma conta bancária */
export async function updateBankAccount(
  id: string,
  payload: UpdateBankAccountRequest,
  nestId?: string,
): Promise<BankAccountResponse> {
  const raw = await httpClient.put<unknown>(ENDPOINTS.bankAccounts.update(id), payload, nestId);
  return safeParse(BankAccountResponseSchema, raw, 'updateBankAccount');
}
