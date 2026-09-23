import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
  toggle: () => Promise<boolean>;
}

/**
 * Hook para gerenciar a Screen Wake Lock API do navegador.
 * Mantém o display do smartphone aceso enquanto o usuário estiver no Modo Mercado.
 */
export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState<boolean>(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'wakeLock' in navigator && typeof navigator.wakeLock?.request === 'function';

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignora erros ao soltar o lock
      } finally {
        wakeLockRef.current = null;
        setIsActive(false);
      }
    }
  }, []);

  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      // Se já houver um lock ativo, solta primeiro
      if (wakeLockRef.current) {
        await release();
      }

      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setIsActive(true);

      sentinel.addEventListener('release', () => {
        wakeLockRef.current = null;
        setIsActive(false);
      });

      return true;
    } catch (err) {
      // Pode falhar se a bateria estiver muito baixa ou o sistema negar
      console.warn('[useWakeLock] Falha ao solicitar bloqueio de tela:', err);
      setIsActive(false);
      return false;
    }
  }, [isSupported, release]);

  const toggle = useCallback(async (): Promise<boolean> => {
    if (isActive) {
      await release();
      return false;
    } else {
      return await request();
    }
  }, [isActive, release, request]);

  // Reativa o lock automaticamente quando o usuário voltar para a aba do Ninho caso estivesse ativo
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        await request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, isActive, request]);

  // Libera o lock ao desmontar o componente
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    request,
    release,
    toggle,
  };
}
