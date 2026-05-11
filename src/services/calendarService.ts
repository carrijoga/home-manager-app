/**
 * Serviço para agenda do dashboard.
 * TODO: endpoint de calendário ainda não disponível.
 */

import { mockCalendarEvents } from '@/mocks/data';
import { DATA_MODE } from './api/config';

export interface CalendarEventPreview {
  id: string;
  title: string;
  startsAt: string;
  location?: string;
}

export async function getUpcomingEvents(limit = 4): Promise<CalendarEventPreview[]> {
  if (DATA_MODE === 'mock') {
    const now = Date.now();
    const events = [...mockCalendarEvents]
      .filter((event) => new Date(event.startsAt).getTime() >= now)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .slice(0, limit);

    return new Promise((resolve) => setTimeout(() => resolve(events), 100));
  }

  // TODO: API not available yet
  return [];
}
