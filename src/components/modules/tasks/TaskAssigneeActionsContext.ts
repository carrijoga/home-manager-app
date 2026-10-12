import { createContext, useContext } from 'react';

/** Conclui (`done = true`) ou reabre a parte de um responsável específico. */
export type ToggleAssigneeHandler = (taskId: string, assigneeUserId: string, done: boolean) => void;

/** Fornecido por Tasks.tsx; evita repassar a ação por TaskListView/KanbanBoard/KanbanColumn. */
export const TaskAssigneeActionsContext = createContext<ToggleAssigneeHandler | null>(null);

export function useToggleAssignee(): ToggleAssigneeHandler | null {
  return useContext(TaskAssigneeActionsContext);
}
