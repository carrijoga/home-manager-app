import React from 'react';
import { motion } from 'framer-motion';
import { Spinner } from '../ui/spinner';

/**
 * Componente de botão reutilizável com animações Framer Motion
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  fullWidth = false,
  icon: Icon = null,
  loading = false
}) => {
  const baseClasses = 'py-2 px-4 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white focus:ring-primary-400 dark:bg-primary-600 dark:hover:bg-primary-700',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white focus:ring-secondary-400 dark:bg-secondary-600 dark:hover:bg-secondary-700',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    purple: 'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 focus:ring-purple-500',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:border-primary-600 dark:text-primary-400 dark:hover:bg-gray-700 focus:ring-primary-400'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const MotionButton = motion.button;

  return (
    <MotionButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
    >
      <span className="flex items-center justify-center space-x-2">
        {loading ? <Spinner size="sm" /> : Icon && <Icon size={18} />}
        <span>{children}</span>
      </span>
    </MotionButton>
  );
};

export default Button;
