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
    primary: 'bg-ninho-500 dark:bg-dark-accent-ninho text-white dark:text-dark-text-primary hover:bg-ninho-600 dark:hover:bg-opacity-90 focus:ring-ninho-400 dark:focus:ring-dark-accent-ninho',
    secondary: 'bg-serenidade-500 dark:bg-dark-accent-serenidade text-white dark:text-dark-text-primary hover:bg-serenidade-600 dark:hover:bg-opacity-90 focus:ring-serenidade-400 dark:focus:ring-dark-accent-serenidade',
    success: 'bg-natureza-500 dark:bg-dark-accent-natureza text-white dark:text-dark-text-primary hover:bg-natureza-600 dark:hover:bg-opacity-90 focus:ring-natureza-400 dark:focus:ring-dark-accent-natureza',
    danger: 'bg-red-600 dark:bg-red-500 text-white dark:text-dark-text-primary hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400',
    warning: 'bg-aconchego-500 dark:bg-dark-accent-aconchego text-white dark:text-dark-bg-primary hover:bg-aconchego-600 dark:hover:bg-opacity-90 focus:ring-aconchego-400 dark:focus:ring-dark-accent-aconchego',
    purple: 'bg-purple-600 dark:bg-purple-500 text-white dark:text-dark-text-primary hover:bg-purple-700 dark:hover:bg-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400',
    outline: 'border-2 border-ninho-500 dark:border-dark-accent-ninho text-ninho-600 dark:text-dark-text-primary hover:bg-ninho-50 dark:hover:bg-dark-bg-hover focus:ring-ninho-400 dark:focus:ring-dark-accent-ninho'
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
