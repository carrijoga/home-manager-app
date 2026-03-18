
/**
 * Componente de card reutilizável
 */
const Card = ({
  children,
  title = null,
  subtitle = null,
  className = '',
  headerAction = null,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-card border border-border',
    primary: 'bg-card border-l-4 border-primary',
    success: 'bg-card border-l-4 border-sage-400',
    warning: 'bg-card border-l-4 border-honey-400',
    danger: 'bg-card border-l-4 border-terracotta-500',
    info: 'bg-card border-l-4 border-sky-400',
    elevated: 'bg-linen-300 border border-border/40 shadow-md'
  };

  return (
    <div className={`rounded-xl shadow-md p-[var(--space-md)] hover-lift transition-all duration-[length:var(--dur-slow)] ${variantClasses[variant]} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h2 className="font-display text-[var(--text-xl)] font-bold tracking-tight text-card-foreground">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
