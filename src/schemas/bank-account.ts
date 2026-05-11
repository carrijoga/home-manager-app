import { z } from 'zod';
import { UuidSchema, MoneySchema } from './shared';
import { AccountTypeSchema } from './enums';

// ── Requests ──────────────────────────────────────────────────────────────────

export const CreateBankAccountRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: AccountTypeSchema,
  balance: MoneySchema,
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

export const BankAccountResponseSchema = z.object({
  bankAccountId: UuidSchema,
  name: z.string(),
  type: AccountTypeSchema,
  balance: MoneySchema,
  color: z.string(),
});
export type BankAccountResponse = z.infer<typeof BankAccountResponseSchema>;
