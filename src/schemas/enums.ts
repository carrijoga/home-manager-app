import { z } from 'zod';

/**
 * Enums numéricos do servidor (valores inteiros).
 * Os valores comentados são estimativas — confirmar com o backend.
 */

// Tipo da transação financeira: 0 = Despesa, 1 = Receita
export const TransactionTypeSchema = z.number().int();
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export const TransactionType = {
  Expense: 0,
  Income: 1,
} as const;

// Método de pagamento: 0 = Dinheiro, 1 = Débito, 2 = Crédito, 3 = PIX, 4 = Boleto, 5 = Outro
export const ApiPaymentMethodSchema = z.number().int();
export type ApiPaymentMethod = z.infer<typeof ApiPaymentMethodSchema>;
export const ApiPaymentMethod = {
  Cash: 0,
  Debit: 1,
  Credit: 2,
  Pix: 3,
  Boleto: 4,
  Other: 5,
} as const;

// Tipo de conta bancária: 0 = Corrente, 1 = Poupança, 2 = Investimento
export const AccountTypeSchema = z.number().int();
export type AccountType = z.infer<typeof AccountTypeSchema>;
export const AccountType = {
  Checking: 0,
  Savings: 1,
  Investment: 2,
} as const;

// Papel no Nest: 0 = Dono, 1 = Admin, 2 = Membro
export const NestRoleSchema = z.number().int();
export type NestRole = z.infer<typeof NestRoleSchema>;
export const NestRole = {
  Owner: 0,
  Admin: 1,
  Member: 2,
} as const;

// Tipo de notificação: 0 = Info, 1 = Warning, 2 = Error, 3 = Success
export const NotificationTypeSchema = z.number().int();
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export const NotificationType = {
  Info: 0,
  Warning: 1,
  Error: 2,
  Success: 3,
} as const;

// Tipo de fonte financeira: 0 = Manual, 1 = BankAccount
export const FinancialSourceTypeSchema = z.number().int();
export type FinancialSourceType = z.infer<typeof FinancialSourceTypeSchema>;
export const FinancialSourceType = {
  Manual: 0,
  BankAccount: 1,
} as const;

// Módulo de origem: 0 = Financial, 1 = Shopping, etc.
export const ModulesSchema = z.number().int();
export type Modules = z.infer<typeof ModulesSchema>;

// Tipo de dono de attachment
export const AttachmentOwnerTypeSchema = z.number().int();
export type AttachmentOwnerType = z.infer<typeof AttachmentOwnerTypeSchema>;

// Tipo de unidade dos itens de compra — valores assumidos, confirmar com o backend
// TODO: confirmar valores exatos com o backend
export const UnitTypeSchema = z.number().int();
export type UnitType = z.infer<typeof UnitTypeSchema>;
export const UnitType = {
  Unidade: 0,
  Kg: 1,
  G: 2,
  L: 3,
  ML: 4,
  Duzia: 5,
  Caixa: 6,
  Pacote: 7,
} as const;

/** Labels em PT-BR para exibição no frontend. */
export const UNIT_TYPE_LABELS: Record<number, string> = {
  0: 'un',
  1: 'kg',
  2: 'g',
  3: 'L',
  4: 'mL',
  5: 'dz',
  6: 'cx',
  7: 'pct',
};
