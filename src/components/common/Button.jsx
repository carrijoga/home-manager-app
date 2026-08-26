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
  loading = false,
}) => {
  const baseClasses =
    'py-2 px-4 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground focus:ring-primary',
    secondary:
      'bg-secondary hover:bg-secondary/80 active:bg-secondary/70 text-secondary-foreground focus:ring-secondary',
    success:
      'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600',
    danger:
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
    warning:
      'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    purple:
      'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 focus:ring-purple-500',
    outline:
      'border-2 border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20 focus:ring-primary',
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
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
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
