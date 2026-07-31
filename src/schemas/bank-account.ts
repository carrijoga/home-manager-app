import { z } from 'zod';

import { AccountTypeSchema, CardTypeSchema } from './enums';
import { MoneyRequestSchema, MoneySchema, UuidSchema } from './shared';

// ── Requests ──────────────────────────────────────────────────────────────────

export const CreateBankAccountRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: AccountTypeSchema,
  balance: MoneyRequestSchema,
  initialBalance: MoneyRequestSchema,
  color: z.string().min(1, 'Cor é obrigatória'),
});
export type CreateBankAccountRequest = z.infer<typeof CreateBankAccountRequestSchema>;

export const UpdateBankAccountRequestSchema = z.object({
  bankAccountId: UuidSchema,
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
});
export type UpdateBankAccountRequest = z.infer<typeof UpdateBankAccountRequestSchema>;

// ── Responses ─────────────────────────────────────────────────────────────────

export const PaymentCardSummaryResponseSchema = z.object({
  paymentCardId: UuidSchema,
  bankAccountId: UuidSchema.nullable(),
  type: CardTypeSchema,
  name: z.string(),
  color: z.string().nullable(),
  isActive: z.boolean(),
});
export type PaymentCardSummaryResponse = z.infer<typeof PaymentCardSummaryResponseSchema>;

export const BankAccountResponseSchema = z.object({
  bankAccountId: UuidSchema,
  name: z.string(),
  type: AccountTypeSchema,
  balance: MoneySchema,
  initialBalance: MoneySchema,
  color: z.string(),
  paymentCards: z.array(PaymentCardSummaryResponseSchema),
});
export type BankAccountResponse = z.infer<typeof BankAccountResponseSchema>;

export const CanDeleteBankAccountResponseSchema = z.object({
  canDelete: z.boolean(),
  linkedTransactionsCount: z.number().int(),
});
export type CanDeleteBankAccountResponse = z.infer<typeof CanDeleteBankAccountResponseSchema>;

export const InactivateBankAccountResponseSchema = z.object({
  affectedPaymentCardsCount: z.number().int(),
});
export type InactivateBankAccountResponse = z.infer<typeof InactivateBankAccountResponseSchema>;
