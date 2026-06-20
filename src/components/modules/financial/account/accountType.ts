import { AccountType } from '@/schemas/enums';

export const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.Checking, label: 'Conta Corrente' },
  { value: AccountType.Savings, label: 'Poupança' },
  { value: AccountType.Cash, label: 'Dinheiro' },
] as const;

export function accountTypeLabel(type: number): string {
  return ACCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? 'Conta';
}

export function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
