import type { TourDefinition } from '@/types/onboarding';

import { dashboardTour } from './dashboardTour';
import { financialTour } from './financialTour';
import { shoppingTour } from './shoppingTour';
import { tasksTour } from './tasksTour';

export const TOURS: Record<string, TourDefinition> = {
  dashboard: dashboardTour,
  tasks: tasksTour,
  financial: financialTour,
  shopping: shoppingTour,
};

export function getTourById(id: string): TourDefinition | null {
  return TOURS[id] || null;
}

export { dashboardTour, financialTour, shoppingTour, tasksTour };
