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
    default: 'bg-white',
    primary: 'bg-ninho-50 border-l-4 border-ninho-500',
    success: 'bg-natureza-50 border-l-4 border-natureza-500',
    warning: 'bg-aconchego-100 border-l-4 border-aconchego-400',
    danger: 'bg-red-50 border-l-4 border-red-500',
    info: 'bg-serenidade-50 border-l-4 border-serenidade-500'
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${variantClasses[variant]} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h2 className="text-2xl font-bold text-ninho-700">{title}</h2>}
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
