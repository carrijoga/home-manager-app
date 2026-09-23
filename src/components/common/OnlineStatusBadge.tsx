import * as React from 'react';

import { cn } from '@/lib/utils';

export type OnlineStatusSize = 'xs' | 'sm' | 'md' | 'lg';

export interface OnlineStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Se o membro está online no momento. */
  isOnline?: boolean;
  /** Tamanho visual da bolinha. Padrão: 'sm'. */
  size?: OnlineStatusSize;
  /** Se verdadeiro, renderiza a bolinha mesmo quando offline (em tom acinzentado/neutro). */
  showOffline?: boolean;
  /** Se verdadeiro, ativa animação sutil de pulso quando online. Padrão: true. */
  pulse?: boolean;
}

const SIZE_CLASSES: Record<OnlineStatusSize, { dot: string; ring: string }> = {
  xs: {
    dot: 'size-1.5',
    ring: 'ring-[1.5px]',
  },
  sm: {
    dot: 'size-2',
    ring: 'ring-2',
  },
  md: {
    dot: 'size-2.5',
    ring: 'ring-2',
  },
  lg: {
    dot: 'size-3',
    ring: 'ring-2',
  },
};

/**
 * Bolinha indicadora de status de presença online.
 * Exibe cor verde esmeralda com anel de proteção ao redor do avatar quando online.
 */
export function OnlineStatusBadge({
  isOnline = false,
  size = 'sm',
  showOffline = false,
  pulse = true,
  className,
  ...props
}: OnlineStatusBadgeProps) {
  if (!isOnline && !showOffline) {
    return null;
  }

  const { dot, ring } = SIZE_CLASSES[size] ?? SIZE_CLASSES.sm;

  return (
    <span
      role="status"
      aria-label={isOnline ? 'Online' : 'Offline'}
      className={cn('relative flex shrink-0 items-center justify-center', className)}
      {...props}
    >
      {/* Pulso sutil no fundo quando online */}
      {isOnline && pulse && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inline-flex rounded-full bg-emerald-400 opacity-60 animate-ping duration-1000',
            dot
          )}
        />
      )}

      {/* Ponto principal com anel protetor contra o fundo do avatar */}
      <span
        className={cn(
          'relative inline-block rounded-full ring-background shadow-2xs transition-colors duration-200',
          dot,
          ring,
          isOnline ? 'bg-emerald-500 ring-background' : 'bg-muted-foreground/35 ring-background'
        )}
      />
    </span>
  );
}

export interface AvatarWithPresenceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Se o membro está online. */
  isOnline?: boolean;
  /** Tamanho da bolinha. Padrão: 'sm'. */
  badgeSize?: OnlineStatusSize;
  /** Se verdadeiro, mostra bolinha mesmo se offline. */
  showOffline?: boolean;
  /** Classes CSS extras para o badge. */
  badgeClassName?: string;
  /** Elemento do avatar encapsulado. */
  children: React.ReactNode;
}

/**
 * Componente wrapper que encapsula um <Avatar> e posiciona o indicador
 * de presença no canto inferior direito sem risco de corte por overflow-hidden.
 */
export function AvatarWithPresence({
  isOnline = false,
  badgeSize = 'sm',
  showOffline = false,
  badgeClassName,
  className,
  children,
  ...props
}: AvatarWithPresenceProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', className)} {...props}>
      {children}
      {(isOnline || showOffline) && (
        <OnlineStatusBadge
          isOnline={isOnline}
          size={badgeSize}
          showOffline={showOffline}
          className={cn('absolute -bottom-0.5 -right-0.5 z-10 pointer-events-none', badgeClassName)}
        />
      )}
    </div>
  );
}

export interface OnlineStatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  isOnline?: boolean;
  onlineText?: string;
  offlineText?: string;
}

/**
 * Badge em formato de pílula contendo a bolinha verde e o texto (ex: "Online agora" / "Offline").
 */
export function OnlineStatusPill({
  isOnline = false,
  onlineText = 'Online agora',
  offlineText = 'Offline',
  className,
  ...props
}: OnlineStatusPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
        isOnline
          ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-muted/60 text-muted-foreground border border-border/50',
        className
      )}
      {...props}
    >
      <OnlineStatusBadge isOnline={isOnline} size="xs" showOffline pulse={isOnline} />
      <span>{isOnline ? onlineText : offlineText}</span>
    </div>
  );
}
