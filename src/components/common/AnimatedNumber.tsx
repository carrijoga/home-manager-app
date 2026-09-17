import NumberFlow, { continuous, type Format, type Trend } from '@number-flow/react';
import { Calligraph } from 'calligraph';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export type AnimatedNumberVariant = 'number' | 'slots' | 'odometer';

export interface AnimatedNumberProps extends React.HTMLAttributes<HTMLElement> {
  /** Valor numérico a ser animado */
  value: number;
  /** Prefixo opcional (ex: "+", "~", "R$ ") */
  prefix?: string;
  /** Sufixo opcional (ex: " tarefas", " itens", "%") */
  suffix?: string;
  /** Opções de formatação Intl.NumberFormat */
  format?: Intl.NumberFormatOptions;
  /** Locale para formatação (padrão: 'pt-BR') */
  locales?: Intl.LocalesArgument;
  /** Direção da rolagem: 'up', 'down' ou automático (usado em odometer) */
  trend?: Trend;
  /**
   * Tipo de animação:
   * - 'number' (padrão): Rolling minimalista estilo Apple via Calligraph/Motion
   * - 'slots': Efeito roleta slot-machine suave via Calligraph
   * - 'odometer': Odômetro contínuo clássico via NumberFlow
   */
  variant?: AnimatedNumberVariant;
  /** Preset de animação de mola do Calligraph (padrão: 'smooth') */
  animation?: 'smooth' | 'snappy' | 'bouncy' | 'default';
  /** Se deve animar do zero até o valor ao carregar/montar na tela (padrão: true) */
  animateOnMount?: boolean;
  /** Se deve animar a largura conforme os dígitos mudam (padrão: true) */
  autoSize?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Duração personalizada em milissegundos para odometer (padrão: 750ms) */
  duration?: number;
}

const DEFAULT_TIMING: EffectTiming = {
  duration: 750,
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

/**
 * AnimatedNumber — Componente de números animados com física refinada.
 * Por padrão, utiliza o Calligraph com spring minimalista no padrão Apple/iOS.
 */
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  format,
  locales = 'pt-BR',
  trend,
  variant = 'number',
  animation = 'smooth',
  className,
  duration = 750,
  animateOnMount = true,
  autoSize = true,
  ...rest
}: AnimatedNumberProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const isMountedRef = useRef(false);

  // Inicia em 0 se animateOnMount estiver ativo para garantir a rolagem ao entrar na tela
  const [displayValue, setDisplayValue] = useState<number>(() =>
    animateOnMount && safeValue !== 0 ? 0 : safeValue
  );

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      if (animateOnMount && safeValue !== 0) {
        const timer = setTimeout(() => {
          setDisplayValue(safeValue);
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      setDisplayValue(safeValue);
    }
  }, [safeValue, animateOnMount]);

  // Se o modo escolhido for 'odometer', renderiza com NumberFlow
  if (variant === 'odometer') {
    const timing: EffectTiming = duration ? { ...DEFAULT_TIMING, duration } : DEFAULT_TIMING;
    return (
      <NumberFlow
        value={displayValue}
        locales={locales}
        format={format as Format}
        prefix={prefix}
        suffix={suffix}
        trend={trend}
        plugins={[continuous]}
        transformTiming={timing}
        spinTiming={timing}
        opacityTiming={timing}
        className={cn('inline-block tabular-nums select-none', className)}
        {...rest}
      />
    );
  }

  // Formata o número conforme opções do Intl.NumberFormat
  const formattedNumber = new Intl.NumberFormat(locales, format).format(displayValue);
  const textContent = `${prefix}${formattedNumber}${suffix}`;

  return (
    <Calligraph
      variant={variant === 'slots' ? 'slots' : 'number'}
      animation={animation}
      initial={animateOnMount}
      autoSize={autoSize}
      className={cn('inline-block tabular-nums select-none', className)}
      {...rest}
    >
      {textContent}
    </Calligraph>
  );
}

export interface AnimatedCurrencyProps extends Omit<AnimatedNumberProps, 'format'> {
  /** Se deve exibir o símbolo da moeda (ex: R$) — padrão: true */
  showCurrency?: boolean;
  /** Número mínimo de casas decimais (padrão: 2) */
  minimumFractionDigits?: number;
  /** Número máximo de casas decimais (padrão: 2) */
  maximumFractionDigits?: number;
  /** Controle de exibição do sinal: 'auto' | 'always' | 'never' | 'exceptZero' */
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero';
}

/**
 * AnimatedCurrency — Animação fluida de valores monetários em Real (BRL).
 */
export function AnimatedCurrency({
  value,
  showCurrency = true,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  signDisplay = 'auto',
  className,
  locales = 'pt-BR',
  animateOnMount = true,
  variant = 'number',
  animation = 'smooth',
  ...rest
}: AnimatedCurrencyProps) {
  const format: Intl.NumberFormatOptions = showCurrency
    ? {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits,
        maximumFractionDigits,
        signDisplay,
      }
    : {
        style: 'decimal',
        minimumFractionDigits,
        maximumFractionDigits,
        signDisplay,
      };

  return (
    <AnimatedNumber
      value={value}
      format={format}
      locales={locales}
      variant={variant}
      animation={animation}
      animateOnMount={animateOnMount}
      className={cn('tabular-nums font-semibold', className)}
      {...rest}
    />
  );
}

export interface AnimatedPercentProps extends Omit<AnimatedNumberProps, 'format'> {
  /** Número de casas decimais (padrão: 0) */
  decimals?: number;
  /** Se deve incluir sinal positivo (+) explicitamente para valores > 0 */
  showSign?: boolean;
}

/**
 * AnimatedPercent — Animação fluida de taxas e porcentagens (ex: 85%, +12%).
 */
export function AnimatedPercent({
  value,
  decimals = 0,
  showSign = false,
  className,
  locales = 'pt-BR',
  animateOnMount = true,
  variant = 'number',
  animation = 'smooth',
  ...rest
}: AnimatedPercentProps) {
  const format: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showSign ? 'always' : 'auto',
  };

  return (
    <AnimatedNumber
      value={value}
      format={format}
      suffix="%"
      locales={locales}
      variant={variant}
      animation={animation}
      animateOnMount={animateOnMount}
      className={cn('tabular-nums font-semibold', className)}
      {...rest}
    />
  );
}

export interface AnimatedTextProps extends React.HTMLAttributes<HTMLElement> {
  /** Texto a ser exibido e transicionado via character morphing */
  children: string | number;
  /** Preset de animação do Calligraph: 'smooth' (padrão) | 'snappy' | 'bouncy' | 'default' */
  animation?: 'smooth' | 'snappy' | 'bouncy' | 'default';
  /** Se deve animar na montagem inicial (padrão: false) */
  animateOnMount?: boolean;
  /** Se deve animar a largura automaticamente (padrão: true) */
  autoSize?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * AnimatedText — Morphing fluido de textos e palavras com LCS diffing (Calligraph).
 * Perfeito para badges de status ("Pendente" -> "Concluído"), botões e labels.
 */
export function AnimatedText({
  children,
  animation = 'smooth',
  animateOnMount = false,
  autoSize = true,
  className,
  ...rest
}: AnimatedTextProps) {
  return (
    <Calligraph
      variant="text"
      animation={animation}
      initial={animateOnMount}
      autoSize={autoSize}
      className={cn('inline-block', className)}
      {...rest}
    >
      {children}
    </Calligraph>
  );
}

export default AnimatedNumber;
