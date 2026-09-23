import { z } from 'zod';

import { CardTypeSchema } from './enums';
import { MoneyRequestSchema, MoneySchema, UuidSchema } from './shared';

// ── Requests (espelham docs/api.json) ───────────────────────────────────────
// Campos condicionais são nullable/optional no contrato; a validação por tipo
// (quais campos são obrigatórios p/ cada CardType) é responsabilidade do
// formulário (PaymentCardSheet), não deste schema — que espelha o contrato.

export const CreatePaymentCardRequestSchema = z.object({
  cardType: CardTypeSchema,
  name: z.string().min(1, 'Nome é obrigatório'),
  bankAccountId: UuidSchema.nullable().optional(),
  creditLimit: MoneyRequestSchema.nullable().optional(),
  dueDay: z.number().int().min(1).max(28).nullable().optional(),
  closingDay: z.number().int().min(1).max(28).nullable().optional(),
  previousBalance: MoneyRequestSchema.nullable().optional(),
  color: z.string().nullable().optional(),
});
export type CreatePaymentCardRequest = z.infer<typeof CreatePaymentCardRequestSchema>;

export const UpdatePaymentCardDetailsRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().nullable().optional(),
});
export type UpdatePaymentCardDetailsRequest = z.infer<typeof UpdatePaymentCardDetailsRequestSchema>;

export const UpdateCreditPaymentCardSettingsRequestSchema = z.object({
  creditLimit: MoneyRequestSchema,
  dueDay: z.number().int().min(1).max(28).nullable().optional(),
  closingDay: z.number().int().min(1).max(28).nullable().optional(),
});
export type UpdateCreditPaymentCardSettingsRequest = z.infer<
  typeof UpdateCreditPaymentCardSettingsRequestSchema
>;

// ── Responses (espelham docs/api.json) ──────────────────────────────────────

export const PaymentCardResponseSchema = z.object({
  paymentCardId: UuidSchema,
  bankAccountId: UuidSchema.nullable(),
  type: CardTypeSchema,
  name: z.string(),
  creditLimit: MoneySchema.nullable(),
  dueDay: MoneySchema.nullable(),
  closingDay: MoneySchema.nullable(),
  previousBalance: MoneySchema.nullable(),
  color: z.string().nullable(),
  isActive: z.boolean(),
});
export type PaymentCardResponse = z.infer<typeof PaymentCardResponseSchema>;

export const CanDeletePaymentCardResponseSchema = z.object({
  canDelete: z.boolean(),
  linkedTransactionsCount: z.number().int(),
});
export type CanDeletePaymentCardResponse = z.infer<typeof CanDeletePaymentCardResponseSchema>;

// ── Mock-only (contrato INVENTADO — NÃO está em docs/api.json) ───────────────
// Fatura/lançamentos ainda não têm back-end. Quando existir, mover para api.json.

export const PaymentCardInvoiceItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: MoneySchema,
  date: z.string(), // ISO date
  categoryName: z.string(),
  icon: z.string(), // emoji
});
export type PaymentCardInvoiceItem = z.infer<typeof PaymentCardInvoiceItemSchema>;

export const PaymentCardInvoiceSchema = z.object({
  paymentCardId: UuidSchema,
  month: z.string(), // 'YYYY-MM'
  total: MoneySchema,
  items: z.array(PaymentCardInvoiceItemSchema),
});
export type PaymentCardInvoice = z.infer<typeof PaymentCardInvoiceSchema>;
