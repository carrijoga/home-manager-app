import { useEffect, useRef } from 'react';

export interface UsePollingOptions {
  /** Interval in milliseconds. Default is 10000 (10 seconds). */
  intervalMs?: number;
  /** Whether polling is enabled. Default is true. */
  enabled?: boolean;
  /** If true, trigger callback immediately on mount. Default is false. */
  runOnMount?: boolean;
}

/**
 * Custom hook to execute background polling at a regular interval.
 * Automatically pauses polling when the document is hidden (background tab)
 * and resumes/triggers polling when the document becomes visible again.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
): void {
  const { intervalMs = 10000, enabled = true, runOnMount = false } = options;
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let isMounted = true;

    const execute = async () => {
      if (document.visibilityState === 'visible' && isMounted) {
        try {
          await savedCallback.current();
        } catch {
          // Silent catch for background polling
        }
      }
    };

    if (runOnMount) {
      void execute();
    }

    const timerId = setInterval(() => {
      void execute();
    }, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void execute();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled, runOnMount]);
}
