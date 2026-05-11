/**
 * Serviço para metas da família no dashboard.
 * TODO: API ainda não disponível — usa dados mock por enquanto.
 */

import { mockGoals } from '@/mocks/data';
import { DATA_MODE } from './api/config';

export interface FamilyGoal {
  id: string;
  categoryLabel: string;
  title: string;
  progress: number;
  remainingLabel: string;
}

export async function getAllGoals(): Promise<FamilyGoal[]> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve([...mockGoals]), 100));
  }

  // TODO: API not available yet
  return [];
}
