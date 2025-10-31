import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Componente de toggle entre tema claro e escuro
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-ninho-100 dark:bg-dark-bg-elevated text-ninho-700 dark:text-dark-accent-aconchego hover:bg-ninho-200 dark:hover:bg-dark-bg-hover transition-all duration-300 focus-ring border border-transparent dark:border-dark-border-default"
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Tema ${theme === 'light' ? 'claro' : 'escuro'} ativo`}
    >
      {theme === 'light' ? (
        <Moon size={20} className="animate-scale-in" />
      ) : (
        <Sun size={20} className="animate-scale-in" />
      )}
    </button>
  );
};

export default ThemeToggle;
