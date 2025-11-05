
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
    success: 'bg-card border-l-4 border-green-500',
    warning: 'bg-card border-l-4 border-yellow-500',
    danger: 'bg-card border-l-4 border-red-500',
    info: 'bg-card border-l-4 border-blue-500'
  };

  return (
    <div className={`rounded-lg shadow-md p-6 hover-lift transition-all duration-300 ${variantClasses[variant]} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>}
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
