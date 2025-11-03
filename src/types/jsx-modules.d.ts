/**
 * Declarações de tipo para módulos .jsx durante a migração para TypeScript
 * Este arquivo permite importar componentes .jsx em arquivos .tsx
 */

// Permitir importação de arquivos .jsx
declare module '*.jsx' {
  const component: React.ComponentType<any>;
  export default component;
  export const ThemeProvider: React.ComponentType<{ children: React.ReactNode }>;
}

// Declarações específicas para contextos
declare module './contexts/ThemeContext' {
  export const ThemeProvider: React.ComponentType<{ children: React.ReactNode }>;
  export const useTheme: () => {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
  };
}

// Declaração para App
declare module './App' {
  const App: React.ComponentType;
  export default App;
}
