import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Verifica preferência do sistema ou localStorage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('ninho-theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'system';
  });

  // Estado para o tema efetivo (resolvido)
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    const savedTheme = localStorage.getItem('ninho-theme') || 'system';
    if (savedTheme === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return savedTheme;
  });

  // Função para obter o tema efetivo baseado na preferência
  const getEffectiveTheme = (themeValue) => {
    if (themeValue === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return themeValue;
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

    // Salva no localStorage
    localStorage.setItem('ninho-theme', theme);

    // Listener para mudanças na preferência do sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const systemTheme = e.matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    // Se estiver em modo system, muda para o oposto do tema atual efetivo
    if (theme === 'system') {
      const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    } else {
      // Alterna entre light e dark
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
