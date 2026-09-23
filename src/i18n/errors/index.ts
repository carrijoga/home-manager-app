import type { ErrorDictionary, SupportedLanguage } from '../types';
import { enUS } from './en-US';
import { esES } from './es-ES';
import { ptBR } from './pt-BR';

const DICTIONARIES: Record<SupportedLanguage, ErrorDictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};

const DEFAULT_ERROR_MESSAGES: Record<SupportedLanguage, string> = {
  'pt-BR': 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  'en-US': 'An unexpected error occurred. Please try again later.',
  'es-ES': 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.',
};

const RATE_LIMIT_MESSAGES: Record<SupportedLanguage, string> = {
  'pt-BR': 'Muitas tentativas. Aguarde alguns segundos e tente novamente.',
  'en-US': 'Too many attempts. Please wait a few seconds and try again.',
  'es-ES': 'Demasiados intentos. Espere unos segundos e inténtelo de nuevo.',
};

/**
 * Retorna a mensagem traduzida correspondente ao código estável fornecido.
 * Se o código não existir no idioma requisitado, tenta fallback para 'pt-BR'.
 * Se ainda assim não for encontrado, retorna undefined.
 */
export function getErrorMessageByCode(
  code: string,
  language: SupportedLanguage = 'pt-BR'
): string | undefined {
  if (!code) return undefined;

  const targetDict = DICTIONARIES[language] ?? DICTIONARIES['pt-BR'];
  if (targetDict && code in targetDict) {
    return targetDict[code];
  }

  // Fallback para pt-BR caso o idioma atual não tenha o código
  if (language !== 'pt-BR') {
    const fallbackDict = DICTIONARIES['pt-BR'];
    if (fallbackDict && code in fallbackDict) {
      return fallbackDict[code];
    }
  }

  return undefined;
}

/**
 * Retorna uma mensagem genérica padrão de erro no idioma selecionado.
 */
export function getDefaultErrorMessage(language: SupportedLanguage = 'pt-BR'): string {
  return DEFAULT_ERROR_MESSAGES[language] ?? DEFAULT_ERROR_MESSAGES['pt-BR'];
}

/**
 * Retorna a mensagem de rate limit (HTTP 429) no idioma selecionado.
 */
export function getRateLimitMessage(language: SupportedLanguage = 'pt-BR'): string {
  return RATE_LIMIT_MESSAGES[language] ?? RATE_LIMIT_MESSAGES['pt-BR'];
}

export { enUS, esES, ptBR };
