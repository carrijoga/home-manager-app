import type { TranslationKey } from '@/i18n';

/**
 * Chaves i18n das saudações do dashboard (`dashboard.greetings.*`).
 * Cada frase termina em vírgula e é seguida do nome do usuário.
 * A frase muda a cada dia (fuso local) e permanece estável durante o dia todo.
 */
const DASHBOARD_GREETING_KEYS = [
  'dashboard.greetings.g0',
  'dashboard.greetings.g1',
  'dashboard.greetings.g2',
  'dashboard.greetings.g3',
  'dashboard.greetings.g4',
  'dashboard.greetings.g5',
  'dashboard.greetings.g6',
  'dashboard.greetings.g7',
  'dashboard.greetings.g8',
  'dashboard.greetings.g9',
  'dashboard.greetings.g10',
  'dashboard.greetings.g11',
  'dashboard.greetings.g12',
  'dashboard.greetings.g13',
] as const satisfies readonly TranslationKey[];

/** Número de dias desde 01/01/1970 na data local — muda à meia-noite local. */
function getLocalDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

export function getDailyGreetingKey(date: Date = new Date()): TranslationKey {
  return DASHBOARD_GREETING_KEYS[getLocalDayNumber(date) % DASHBOARD_GREETING_KEYS.length];
}
