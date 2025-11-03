import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Componente de toggle entre tema claro e escuro com animações
 */
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95, rotate: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="p-2 rounded-lg bg-indigo-100 dark:bg-dark-bg-elevated text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-dark-bg-hover transition-all duration-300 focus-ring border border-transparent dark:border-dark-border-default"
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Sun size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Moon size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
