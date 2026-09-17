import type { LanguageOption, SupportedLanguage } from './types';

const STORAGE_KEY = 'ninho_language';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'pt-BR';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: 'pt-BR', label: 'Português (BR)', nativeLabel: 'Português', available: true },
  { value: 'en-US', label: 'English (US)', nativeLabel: 'English', available: true },
  { value: 'es-ES', label: 'Español (ES)', nativeLabel: 'Español', available: true },
];

/**
 * Normaliza uma string de locale (ex: 'pt', 'pt-BR', 'en', 'es') para um dos SupportedLanguage.
 */
export function normalizeLanguage(lang?: string | null): SupportedLanguage {
  if (!lang) return DEFAULT_LANGUAGE;

  const clean = lang.trim().toLowerCase();
  if (clean.startsWith('pt')) return 'pt-BR';
  if (clean.startsWith('en')) return 'en-US';
  if (clean.startsWith('es')) return 'es-ES';

  return DEFAULT_LANGUAGE;
}

/**
 * Obtém o idioma ativo do usuário.
 * Ordem de prioridade:
 * 1. Valor armazenado em localStorage ('ninho_language')
 * 2. Idioma preferencial do navegador (navigator.language)
 * 3. Fallback padrão ('pt-BR')
 */
export function getCurrentLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return normalizeLanguage(saved);
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      return normalizeLanguage(navigator.language);
    }
  } catch {
    // localStorage inacessível (ex: navegação privada estrita)
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Atualiza o idioma ativo e emite evento customizado para reatividade de componentes.
 */
export function setCurrentLanguage(language: SupportedLanguage): void {
  const normalized = normalizeLanguage(language);

  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // Silencia erros de storage
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ninho:language-changed', {
        detail: { language: normalized },
      })
    );
  }
}
