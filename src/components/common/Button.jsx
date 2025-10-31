import React from 'react';

/**
 * Componente de botão reutilizável
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  fullWidth = false,
  icon: Icon = null
}) => {
  const baseClasses = 'py-2 px-4 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-ninho-500 text-white hover:bg-ninho-600 focus:ring-ninho-400',
    secondary: 'bg-serenidade-500 text-white hover:bg-serenidade-600 focus:ring-serenidade-400',
    success: 'bg-natureza-500 text-white hover:bg-natureza-600 focus:ring-natureza-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-aconchego-500 text-white hover:bg-aconchego-600 focus:ring-aconchego-400',
    purple: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    outline: 'border-2 border-ninho-500 text-ninho-600 hover:bg-ninho-50 focus:ring-ninho-400'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
    >
      <span className="flex items-center justify-center space-x-2">
        {Icon && <Icon size={18} />}
        <span>{children}</span>
      </span>
    </button>
  );
};

export default Button;
