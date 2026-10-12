import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
    onTurnstileLoaded?: () => void;
  }
}

export interface TurnstileWidgetRef {
  reset: () => void;
  getResponse: () => string | undefined;
}

interface TurnstileWidgetProps {
  action?: string;
  onVerify?: (token: string) => void;
  onError?: (errorCode: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ action = 'login', onVerify, onError, onExpire, theme = 'auto', className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAE9TbE_Amh520JAz';

    // Salva callbacks em refs para que mudanças de referência não disparem re-render e desmontem o Turnstile
    const onVerifyRef = useRef(onVerify);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
      onVerifyRef.current = onVerify;
      onErrorRef.current = onError;
      onExpireRef.current = onExpire;
    });

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.warn('[Turnstile] Erro ao resetar widget:', e);
          }
        }
      },
      getResponse: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            return window.turnstile.getResponse(widgetIdRef.current);
          } catch {
            return undefined;
          }
        }
        return undefined;
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile || !isMounted) return;
        if (widgetIdRef.current) return;

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme,
            callback: (token: string) => {
              if (isMounted) {
                console.log('[Turnstile] Token gerado com sucesso para ação:', action);
                onVerifyRef.current?.(token);
              }
            },
            'error-callback': (errorCode: string) => {
              console.warn('[Turnstile] Erro retornado pela Cloudflare:', errorCode);
              if (isMounted) {
                onErrorRef.current?.(errorCode);
              }
            },
            'expired-callback': () => {
              console.warn('[Turnstile] Token expirado');
              if (isMounted) {
                onExpireRef.current?.();
              }
            },
          });
        } catch (err) {
          console.error('[Turnstile] Falha ao renderizar widget:', err);
        }
      };

      const scriptId = 'cloudflare-turnstile-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderWidget();
        };
        document.head.appendChild(script);
      } else if (window.turnstile) {
        renderWidget();
      } else {
        script.addEventListener('load', renderWidget);
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Silencioso se já foi removido
          }
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, action, theme]);

    if (!siteKey) return null;

    return (
      <div className={`flex justify-center my-2 ${className}`}>
        <div ref={containerRef} />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
