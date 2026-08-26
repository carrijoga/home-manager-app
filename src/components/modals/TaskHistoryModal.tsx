import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import type { NestMember } from '@/schemas/nest';
import * as taskService from '@/services/taskService';
import type { Task } from '@/types';

import { PRIORITY_CONFIG } from '../modules/tasks/constants';

interface TaskHistoryModalProps {
  open: boolean;
  onClose: () => void;
  nestId?: string;
  members?: NestMember[];
  onTaskUncompleted?: (task: Task) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function TaskHistoryModal({
  open,
  onClose,
  nestId,
  members = [],
  onTaskUncompleted,
}: TaskHistoryModalProps) {
  const [history, setHistory] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  const loadHistory = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const res = await taskService.getTaskHistory(targetPage, pageSize, nestId);
        setHistory(res.items);
        setTotalCount(res.totalCount);
        setPage(res.page);
      } catch {
        setHistory([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [nestId]
  );

  useEffect(() => {
    if (open) {
      loadHistory(1);
    }
  }, [open, loadHistory]);

  const handleUncomplete = async (task: Task) => {
    try {
      const updated = await taskService.uncompleteTask(task.taskId, nestId);
      if (onTaskUncompleted) {
        onTaskUncompleted(updated);
      }
      // Re-fetch current page
      loadHistory(page);
    } catch {
      // Error is handled upstream or silent fallback
    }
  };

  const getMemberName = (userId?: string | null) => {
    if (!userId) return null;
    const member = members.find((m) => m.userId === userId);
    return member?.name || 'Membro do Ninho';
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <DialogTitle>Histórico de Tarefas Concluídas</DialogTitle>
          </div>
        </DialogHeader>

        <div className="min-h-[260px] space-y-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Carregando histórico...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhuma tarefa concluída no histórico.</p>
            </div>
          ) : (
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {history.map((item) => {
                const priorityCfg =
                  PRIORITY_CONFIG[item.priority as 0 | 1 | 2 | 3] ?? PRIORITY_CONFIG[3];
                const assignedName = getMemberName(item.assignedTo);
                const completedDate = formatDate(item.completedAt);

                return (
                  <div
                    key={item.taskId}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-accent/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sage-500" />
                        <div className="min-w-0">
                          <p className="font-ui break-words text-sm font-medium leading-snug text-foreground">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          {item.details && (
                            <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground/80">
                              {item.details}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUncomplete(item)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Reabrir tarefa"
                      >
                        <RotateCcw size={12} /> Reabrir
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-1 text-xs">
                      <span className={`rounded px-1.5 py-0.5 font-medium ${priorityCfg.pill}`}>
                        {priorityCfg.label}
                      </span>
                      <span className="text-muted-foreground">{item.categoryLabel || 'Geral'}</span>
                      {assignedName && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <User size={11} /> {assignedName}
                        </span>
                      )}
                      {completedDate && (
                        <span className="ml-auto inline-flex items-center gap-1 text-sage-600 dark:text-sage-400">
                          <Calendar size={11} /> Concluída em {completedDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages} ({totalCount} {totalCount === 1 ? 'tarefa' : 'tarefas'})
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadHistory(page - 1)}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadHistory(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Próxima <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
