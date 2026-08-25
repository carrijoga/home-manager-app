import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import * as noticeService from '@/services/noticeService';
import type { Notice } from '@/types';

interface NoticeHistoryModalProps {
  open: boolean;
  onClose: () => void;
  nestId?: string;
}

function formatHistoryDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function NoticeHistoryModal({ open, onClose, nestId }: NoticeHistoryModalProps) {
  const [history, setHistory] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  const loadHistory = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const res = await noticeService.getNoticeHistory(targetPage, pageSize, nestId);
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

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <DialogTitle>Histórico de Recados</DialogTitle>
          </div>
        </DialogHeader>

        <div className="min-h-[220px] space-y-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Carregando histórico...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhum recado anterior no histórico.</p>
            </div>
          ) : (
            <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.noticeId}
                  className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-muted/40 p-3.5"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {item.authorName || 'Autor desconhecido'}
                    </span>
                    <span>{formatHistoryDate(item.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages} ({totalCount} {totalCount === 1 ? 'recado' : 'recados'})
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
