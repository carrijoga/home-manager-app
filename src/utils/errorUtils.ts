import { getCurrentLanguage,getDefaultErrorMessage, getErrorMessageByCode } from '@/i18n';
import type { SupportedLanguage } from '@/i18n/types';
import { ApiError } from '@/services/api/httpClient';

/**
 * Resolve e formata uma mensagem de erro amigável para exibição ao usuário.
 *
 * Prioridade:
 * 1. Tradução do código do erro (ApiError.code ou duck-typed code) via dicionário i18n
 * 2. Mensagem traduzida já presente em ApiError.message
 * 3. Fallback/debug vindo da API (ApiError.fallbackMessage) se for um código desconhecido
 * 4. Mensagem da exceção padrão (Error.message)
 * 5. String de fallback fornecida pelo chamador
 * 6. Mensagem de erro genérica padrão no idioma ativo
 */
export function resolveErrorMessage(
  error: unknown,
  fallback?: string,
  language?: SupportedLanguage
): string {
  const activeLang = language ?? getCurrentLanguage();

  if (!error) {
    return fallback ?? getDefaultErrorMessage(activeLang);
  }

  // Instância de ApiError com código de erro
  if (error instanceof ApiError) {
    if (error.code) {
      const translated = getErrorMessageByCode(error.code, activeLang);
      if (translated) return translated;
    }
    if (error.message && error.message.trim()) {
      return error.message;
    }
    if (error.fallbackMessage && error.fallbackMessage.trim()) {
      return error.fallbackMessage;
    }
    return fallback ?? getDefaultErrorMessage(activeLang);
  }

  // Objeto com propriedade `code` (duck-typing)
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const codeVal = (error as { code?: unknown }).code;
    if (typeof codeVal === 'string' && codeVal.trim()) {
      const translated = getErrorMessageByCode(codeVal, activeLang);
      if (translated) return translated;
    }
  }

  // Erro JavaScript padrão
  if (error instanceof Error) {
    if (error.message && error.message.trim()) {
      return error.message;
    }
    return fallback ?? getDefaultErrorMessage(activeLang);
  }

  // String direta
  if (typeof error === 'string' && error.trim()) {
    // Se for exatamente o nome de um código de erro, traduz; caso contrário, exibe o texto
    const translated = getErrorMessageByCode(error.trim(), activeLang);
    return translated ?? error;
  }

  return fallback ?? getDefaultErrorMessage(activeLang);
}
