
/**
 * Componente de card reutilizável.
 *
 * Design System "Domestic Sanctuary":
 * - Tonal layering: var(--card) sobre var(--background)
 * - Sem bordas explícitas — profundidade via background shift
 * - Shadow ambiente: 4% opacity, sem drop shadow padrão
 * - rounded-3xl (1.5rem) para containers grandes
 */
const Card = ({
  children,
  title = null,
  subtitle = null,
  className = '',
  headerAction = null,
}) => {
  return (
    <div
      className={`rounded-3xl p-[var(--space-md)] transition-all duration-[length:var(--dur-slow)] ${className}`}
      style={{
        background: 'var(--card)',
        boxShadow: '0 1px 0 var(--border), 0 2px 12px color-mix(in srgb, var(--foreground) 6%, transparent)',
      }}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-start mb-[var(--space-md)]">
          <div>
            {title && (
              <h2 className="font-editorial text-[var(--text-xl)] font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
