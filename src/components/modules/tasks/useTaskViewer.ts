import { useMemo } from 'react';

import { canCompleteOthers } from '@/components/modules/tasks/taskParts';
import { useApp } from '@/contexts/AppContext';
import { NestRole } from '@/schemas/enums';
import { DATA_MODE } from '@/services/api/config';

export interface TaskViewer {
  userId: string;
  role: number;
  canCompleteOthers: boolean;
}

/** Usuário logado e papel no ninho ativo (mock sem ninho = Owner, como no DashboardV2). */
export function useTaskViewer(): TaskViewer {
  const { user, activeNestId } = useApp();
  const userId = user?.id ?? '';
  const role =
    user?.nests?.find((n) => n.nestId === activeNestId)?.role ??
    (DATA_MODE === 'mock' ? NestRole.Owner : NestRole.Member);
  return useMemo(
    () => ({ userId, role, canCompleteOthers: canCompleteOthers(role) }),
    [userId, role]
  );
}
