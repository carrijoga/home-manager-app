import { z } from 'zod';
import { UuidSchema, DateTimeSchema, DateSchema, MoneySchema, PaginatedResponseSchema } from './shared';
import { TransactionTypeSchema, ApiPaymentMethodSchema, FinancialSourceTypeSchema, ModulesSchema } from './enums';

// ── Requests ──────────────────────────────────────────────────────────────────

export const CreateTransactionRequestSchema = z.object({
  type: TransactionTypeSchema,
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: MoneySchema,
  transactionDate: DateTimeSchema,
  dueDate: DateTimeSchema,
  categoryId: UuidSchema,
  responsibleUserId: UuidSchema,
  sourceType: FinancialSourceTypeSchema,
  sourceId: UuidSchema.optional(),
});
export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>;

export const AddPaymentRequestSchema = z.object({
  transactionId: UuidSchema,
  amount: MoneySchema,
  discount: MoneySchema.optional(),
  interest: MoneySchema.optional(),
  method: ApiPaymentMethodSchema,
  paymentDate: DateTimeSchema,
  paidByUserId: UuidSchema,
  observation: z.string().nullable().optional(),
});
export type AddPaymentRequest = z.infer<typeof AddPaymentRequestSchema>;

export const RemovePaymentRequestSchema = z.object({
  financialTransactionId: UuidSchema,
  paymentId: UuidSchema,
  removedByUserId: UuidSchema,
  observation: z.string().nullable().optional(),
});
export type RemovePaymentRequest = z.infer<typeof RemovePaymentRequestSchema>;

export const FinancialTransactionFilterSchema = z.object({
  page: z.number().int().optional(),
  pageSize: z.number().int().optional(),
  ids: z.array(UuidSchema).nullable().optional(),
  types: z.array(TransactionTypeSchema).nullable().optional(),
  description: z.string().nullable().optional(),
  minValue: MoneySchema.nullable().optional(),
  maxValue: MoneySchema.nullable().optional(),
  minTransactionDate: DateSchema.nullable().optional(),
  maxTransactionDate: DateSchema.nullable().optional(),
  minDueDate: DateSchema.nullable().optional(),
  maxDueDate: DateSchema.nullable().optional(),
  responsibleUserIds: z.array(UuidSchema).nullable().optional(),
  categoryIds: z.array(UuidSchema).nullable().optional(),
  origins: z.array(ModulesSchema).nullable().optional(),
  sourceTypes: z.array(FinancialSourceTypeSchema).nullable().optional(),
  sourceIds: z.array(UuidSchema).nullable().optional(),
  isPaid: z.boolean().nullable().optional(),
  isOverdue: z.boolean().nullable().optional(),
});
export type FinancialTransactionFilter = z.infer<typeof FinancialTransactionFilterSchema>;

// ── Responses ─────────────────────────────────────────────────────────────────

export const FinancialTransactionPaymentResponseSchema = z.object({
  financialTransactionPaymentId: UuidSchema,
  financialTransactionId: UuidSchema,
  nestId: UuidSchema,
  amount: MoneySchema,
  discount: MoneySchema,
  interest: MoneySchema,
  method: ApiPaymentMethodSchema,
  methodName: z.string().nullable().optional(),
  paymentDate: DateTimeSchema,
  paidByUserId: UuidSchema,
  paidByUserFullName: z.string(),
  observation: z.string().nullable().optional(),
});
export type FinancialTransactionPaymentResponse = z.infer<typeof FinancialTransactionPaymentResponseSchema>;

export const FinancialTransactionResponseSchema = z.object({
  financialTransactionId: UuidSchema,
  nestId: UuidSchema,
  transactionType: TransactionTypeSchema,
  description: z.string(),
  value: MoneySchema,
  transactionDate: DateTimeSchema,
  dueDate: DateTimeSchema,
  responsibleUserId: UuidSchema,
  responsibleUserName: z.string(),
  categoryId: UuidSchema,
  categoryName: z.string(),
  origin: ModulesSchema,
  originName: z.string().nullable().optional(),
  observation: z.string().nullable().optional(),
  sourceType: FinancialSourceTypeSchema,
  sourceId: UuidSchema,
  sourceName: z.string().nullable().optional(),
  payments: z.array(FinancialTransactionPaymentResponseSchema),
  isPaid: z.boolean(),
  isOverdue: z.boolean(),
});
export type FinancialTransactionResponse = z.infer<typeof FinancialTransactionResponseSchema>;

export const FinancialTransactionListResponseSchema = PaginatedResponseSchema(FinancialTransactionResponseSchema);
export type FinancialTransactionListResponse = z.infer<typeof FinancialTransactionListResponseSchema>;
