import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import type { FC } from 'react';

import { useTheme } from '@/contexts/ThemeContext';

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Componente de toggle entre tema claro e escuro com animações
 */
export const ThemeToggle: FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95, rotate: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`focus-ring rounded-lg border border-transparent bg-primary/10 p-2 text-primary transition-all duration-300 hover:bg-primary/20 ${className}`}
      aria-label={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
      title={`Tema ${isDark ? 'escuro' : 'claro'} ativo`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Sun size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Moon size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
