import React from 'react';

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
    default: 'bg-white dark:bg-dark-bg-elevated border border-gray-100 dark:border-dark-border-subtle',
    primary: 'bg-ninho-50 dark:bg-dark-bg-elevated border-l-4 border-ninho-500 dark:border-dark-accent-ninho dark:border-dark-border-subtle dark:border-l-4',
    success: 'bg-natureza-50 dark:bg-dark-bg-elevated border-l-4 border-natureza-500 dark:border-dark-accent-natureza dark:border-dark-border-subtle dark:border-l-4',
    warning: 'bg-aconchego-100 dark:bg-dark-bg-elevated border-l-4 border-aconchego-400 dark:border-dark-accent-aconchego dark:border-dark-border-subtle dark:border-l-4',
    danger: 'bg-red-50 dark:bg-dark-bg-elevated border-l-4 border-red-500 dark:border-red-400 dark:border-dark-border-subtle dark:border-l-4',
    info: 'bg-serenidade-50 dark:bg-dark-bg-elevated border-l-4 border-serenidade-500 dark:border-dark-accent-serenidade dark:border-dark-border-subtle dark:border-l-4'
  };

  return (
    <div className={`rounded-lg shadow-md dark:shadow-lg p-6 hover-lift transition-all duration-300 ${variantClasses[variant]} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h2 className="text-2xl font-bold text-ninho-700 dark:text-dark-text-primary">{title}</h2>}
            {subtitle && <p className="text-gray-600 dark:text-dark-text-secondary mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
