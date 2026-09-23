import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePolling } from '@/hooks/usePolling';
import type { NestMemberPresence } from '@/schemas/nest';
import { getOnlineNestMembers } from '@/services/nestService';

export interface UseNestPresenceOptions {
  /** ID do ninho para consultar a presença. Se omitido/null, o hook fica inativo. */
  nestId?: string | null;
  /** Intervalo de polling em milissegundos. Padrão: 30000 (30 segundos). */
  intervalMs?: number;
  /** Se o polling está habilitado. Padrão: true (quando nestId fornecido). */
  enabled?: boolean;
  /** Callback opcional chamado quando o status de presença é atualizado. */
  onPresenceUpdate?: (presences: NestMemberPresence[]) => void;
}

export interface UseNestPresenceResult {
  /** Lista completa de membros com seus respectivos status de presença. */
  presence: NestMemberPresence[];
  /** Dicionário O(1) de mapeamento userId -> isOnline. */
  isOnlineMap: Record<string, boolean>;
  /** Quantidade de membros online no momento. */
  onlineCount: number;
  /** Se a requisição inicial está em andamento. */
  isLoading: boolean;
  /** Função para forçar revalidação imediata. */
  refetch: () => Promise<NestMemberPresence[]>;
}

/**
 * Hook para gerenciar e monitorar a presença online dos membros do Ninho.
 *
 * Utiliza o endpoint `GET /api/nests/presence/online` e efetua polling inteligente
 * a cada 30-60s, pausando automaticamente em abas inativas via `usePolling`.
 */
export function useNestPresence(options: UseNestPresenceOptions = {}): UseNestPresenceResult {
  const {
    nestId,
    intervalMs = 30000,
    enabled = Boolean(nestId),
    onPresenceUpdate,
  } = options;

  const [presence, setPresence] = useState<NestMemberPresence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const onPresenceUpdateRef = useRef(onPresenceUpdate);

  useEffect(() => {
    onPresenceUpdateRef.current = onPresenceUpdate;
  }, [onPresenceUpdate]);

  const fetchPresence = useCallback(async (): Promise<NestMemberPresence[]> => {
    if (!nestId || !enabled) {
      setPresence([]);
      return [];
    }

    try {
      const data = await getOnlineNestMembers(nestId);
      if (isMountedRef.current) {
        setPresence(data);
        onPresenceUpdateRef.current?.(data);
      }
      return data;
    } catch {
      return [];
    }
  }, [nestId, enabled]);

  // Carrega inicialmente ao montar ou quando nestId mudar
  useEffect(() => {
    isMountedRef.current = true;
    if (nestId && enabled) {
      setIsLoading(true);
      fetchPresence().finally(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });
    } else {
      setPresence([]);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [nestId, enabled, fetchPresence]);

  // Polling em background com pausa em aba oculta
  usePolling(
    async () => {
      await fetchPresence();
    },
    {
      intervalMs,
      enabled: Boolean(nestId && enabled),
      runOnMount: false, // Já tratado pelo useEffect acima com controle de loading
    }
  );

  const isOnlineMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of presence) {
      if (item.userId) {
        map[item.userId] = item.isOnline;
      }
    }
    return map;
  }, [presence]);

  const onlineCount = useMemo(() => {
    return presence.filter((p) => p.isOnline).length;
  }, [presence]);

  return {
    presence,
    isOnlineMap,
    onlineCount,
    isLoading,
    refetch: fetchPresence,
  };
}
