import type { OnboardingState } from '@/types/onboarding';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

const STORAGE_KEY_PREFIX = 'ninho_onboarding_';

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}${userId}` : `${STORAGE_KEY_PREFIX}guest`;
}

/**
 * Lê o estado do onboarding do LocalStorage (rápido e offline)
 */
export function getLocalOnboardingState(userId?: string): OnboardingState {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        hasCompletedInitial: Boolean(parsed.hasCompletedInitial),
        completedTours: parsed.completedTours || {},
      };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[onboardingService] Erro ao ler do localStorage:', err);
    }
  }

  return {
    hasCompletedInitial: DATA_MODE === 'mock',
    completedTours: DATA_MODE === 'mock' ? {
      dashboard: true,
      tasks: true,
      shopping: true,
      financial: true,
      calendar: true,
      account: true,
      card: true,
    } : {},
  };
}

/**
 * Salva o estado do onboarding no LocalStorage
 */
export function saveLocalOnboardingState(state: OnboardingState, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[onboardingService] Erro ao salvar no localStorage:', err);
    }
  }
}

/**
 * Carrega o estado de onboarding do usuário da API (com fallback no LocalStorage)
 */
export async function fetchOnboardingState(userId?: string): Promise<OnboardingState> {
  const localState = getLocalOnboardingState(userId);

  if (DATA_MODE === 'mock' || !userId) {
    return localState;
  }

  try {
    // Obtém via endpoint de configurações do usuário
    const config = await httpClient.get<{
      hasCompletedInitialOnboarding?: boolean;
      completedOnboardingTours?: string[] | Record<string, boolean>;
    }>(ENDPOINTS.users.meConfiguration);

    if (config) {
      let completedTours: Record<string, boolean> = { ...localState.completedTours };

      if (Array.isArray(config.completedOnboardingTours)) {
        config.completedOnboardingTours.forEach((tourId) => {
          completedTours[tourId] = true;
        });
      } else if (config.completedOnboardingTours && typeof config.completedOnboardingTours === 'object') {
        completedTours = { ...completedTours, ...config.completedOnboardingTours };
      }

      const mergedState: OnboardingState = {
        hasCompletedInitial:
          config.hasCompletedInitialOnboarding ?? localState.hasCompletedInitial,
        completedTours,
      };

      saveLocalOnboardingState(mergedState, userId);
      return mergedState;
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.info(
        '[onboardingService] API de onboarding ainda não disponível no backend. Usando cache local.',
        err
      );
    }
  }

  return localState;
}

/**
 * Sincroniza a conclusão do onboarding inicial com a API
 */
export async function syncCompleteInitial(userId?: string): Promise<void> {
  if (DATA_MODE === 'mock' || !userId) return;

  try {
    await httpClient.post(ENDPOINTS.users.onboardingCompleteInitial, {}).catch(() => {});
  } catch {
    // Silencioso se houver falha de rede
  }
}

/**
 * Sincroniza a conclusão do tour de uma tela específica com a API
 */
export async function syncCompleteTour(tourId: string, userId?: string): Promise<void> {
  if (DATA_MODE === 'mock' || !userId) return;

  try {
    await httpClient.post(ENDPOINTS.users.onboardingCompleteTour(tourId), {}).catch(() => {});
  } catch {
    // Silencioso se houver falha de rede
  }
}

/**
 * Reseta o status de um tour específico na API
 */
export async function syncResetTour(tourId: string, userId?: string): Promise<void> {
  if (DATA_MODE === 'mock' || !userId) return;

  try {
    await httpClient.del(ENDPOINTS.users.onboardingResetTour(tourId)).catch(() => {});
  } catch {
    // Silencioso se houver falha de rede
  }
}

