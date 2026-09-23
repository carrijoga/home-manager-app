import type { SupportedLanguage } from '../types';
import { enUS } from './en-US';
import { esES } from './es-ES';
import { ptBR, type UiDictionary } from './pt-BR';

export const UI_DICTIONARIES: Record<SupportedLanguage, UiDictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};

export type { UiDictionary };

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<UiDictionary>;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Traduz uma chave da interface para o idioma requisitado.
 * Suporta interpolação de variáveis: `t('dashboard.welcome', { name: 'João' })` -> "Olá, João!"
 */
export function translateUiKey(
  key: string,
  language: SupportedLanguage = 'pt-BR',
  params?: Record<string, string | number>
): string {
  const dict = UI_DICTIONARIES[language] ?? UI_DICTIONARIES['pt-BR'];
  let text = getNestedValue(dict as unknown as Record<string, unknown>, key);

  // Fallback para pt-BR se a chave não existir no idioma alvo
  if (!text && language !== 'pt-BR') {
    text = getNestedValue(UI_DICTIONARIES['pt-BR'] as unknown as Record<string, unknown>, key);
  }

  if (!text) {
    return key;
  }

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
  }

  return text;
}

export { enUS, esES, ptBR };
