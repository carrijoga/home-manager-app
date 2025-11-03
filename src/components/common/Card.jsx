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
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    primary: 'bg-primary-50 dark:bg-gray-800 border-l-4 border-primary-500 dark:border-primary-600',
    success: 'bg-green-50 dark:bg-gray-800 border-l-4 border-green-500 dark:border-green-600',
    warning: 'bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-500 dark:border-yellow-600',
    danger: 'bg-red-50 dark:bg-gray-800 border-l-4 border-red-500 dark:border-red-600',
    info: 'bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-600'
  };

  return (
    <div className={`rounded-lg shadow-md dark:shadow-lg p-6 hover-lift transition-all duration-300 ${variantClasses[variant]} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h2 className="text-2xl font-bold text-primary-700 dark:text-gray-100">{title}</h2>}
            {subtitle && <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
