import { z } from 'zod';

import { MoneyRequestSchema, MoneySchema, UuidSchema } from './shared';

// ── Requests (espelham docs/api.json) ───────────────────────────────────────

// Nota: closingDay NÃO existe no contrato de create da API (só no response/update).
export const CreateCreditCardRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  limit: MoneyRequestSchema,
  dueDay: z.number().int().min(1).max(31),
  previousBalance: MoneyRequestSchema,
  color: z.string().min(1, 'Cor é obrigatória'),
  bankAccountId: UuidSchema.nullable().optional(),
});
export type CreateCreditCardRequest = z.infer<typeof CreateCreditCardRequestSchema>;

export const UpdateCreditCardRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
  creditLimit: MoneyRequestSchema,
  closingDay: z.number().int().min(1).max(31),
});
export type UpdateCreditCardRequest = z.infer<typeof UpdateCreditCardRequestSchema>;

// ── Responses (espelham docs/api.json) ──────────────────────────────────────

export const CreditCardResponseSchema = z.object({
  creditCardId: UuidSchema,
  name: z.string(),
  creditLimit: MoneySchema,
  dueDay: MoneySchema,
  closingDay: MoneySchema,
  previousBalance: MoneySchema,
  color: z.string(),
  isActive: z.boolean(),
  bankAccountId: UuidSchema.nullable(),
});
export type CreditCardResponse = z.infer<typeof CreditCardResponseSchema>;

// ── Mock-only (contrato INVENTADO — NÃO está em docs/api.json) ───────────────
// Fatura/lançamentos ainda não têm back-end. Quando existir, mover para api.json.

export const CreditCardInvoiceItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: MoneySchema,
  date: z.string(), // ISO date
  categoryName: z.string(),
  icon: z.string(), // emoji
});
export type CreditCardInvoiceItem = z.infer<typeof CreditCardInvoiceItemSchema>;

export const CreditCardInvoiceSchema = z.object({
  creditCardId: UuidSchema,
  month: z.string(), // 'YYYY-MM'
  total: MoneySchema,
  items: z.array(CreditCardInvoiceItemSchema),
});
export type CreditCardInvoice = z.infer<typeof CreditCardInvoiceSchema>;
