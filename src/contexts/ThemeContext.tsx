import type { FC, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  // Verifica preferência do sistema ou localStorage
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('ninho-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
      return savedTheme as ThemeMode;
    }
    return 'system';
  });

  // Estado para o tema efetivo (resolvido)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('ninho-theme') || 'system';
    if (savedTheme === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  // Função para obter o tema efetivo baseado na preferência
  const getEffectiveTheme = (themeValue: ThemeMode): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return themeValue === 'dark' ? 'dark' : 'light';
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const newEffectiveTheme = getEffectiveTheme(theme);

    // Atualiza o estado do tema efetivo
    setEffectiveTheme(newEffectiveTheme);

    // Remove a classe anterior
    root.classList.remove('light', 'dark');

    // Adiciona a nova classe
    root.classList.add(newEffectiveTheme);
    root.style.colorScheme = newEffectiveTheme;

    // Salva no localStorage
    localStorage.setItem('ninho-theme', theme);

    // Listener para mudanças na preferência do sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const systemTheme = e.matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
        root.style.colorScheme = systemTheme;
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    // Se estiver em modo system, muda para o oposto do tema atual efetivo
    if (theme === 'system') {
      const newTheme: ThemeMode = effectiveTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    } else {
      // Alterna entre light e dark
      const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
