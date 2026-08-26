import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

import '../src/index.css';
import '../src/animations.css';

/**
 * Aplica o tema escolhido na toolbar via o próprio ThemeContext.
 *
 * Importante: não mexer na classe do <html> por fora. O ThemeProvider já
 * escreve `light`/`dark` no documentElement dentro de um useEffect — fazer
 * isso em paralelo criaria duas fontes de verdade que se sobrescrevem.
 */
const ThemeSync = ({ theme, children }: { theme: string; children: React.ReactNode }) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
};

const withTheme: Decorator = (Story, context) => (
  <ThemeProvider>
    <ThemeSync theme={context.globals.theme as string}>
      <div className="bg-background text-foreground min-h-screen p-6">
        <Story />
      </div>
      <Toaster />
    </ThemeSync>
  </ThemeProvider>
);

/**
 * Providers de aplicação, ligados por story via `parameters`.
 *
 * `AppProvider` dispara chamadas de serviço ao montar, então ele fica
 * opt-in: stories de componentes puros não devem pagar esse custo. Ative
 * com `parameters: { app: true }` — ou `{ router: true }` quando só o
 * React Router for necessário.
 *
 * O `AppProvider` só funciona aqui porque os serviços caem no modo mock
 * (`VITE_DATA_MODE`, definido em main.ts), servindo dados de src/mocks.
 */
const withAppProviders: Decorator = (Story, context) => {
  const needsApp = context.parameters.app === true;
  const needsRouter = needsApp || context.parameters.router === true;

  let tree = <Story />;

  if (needsApp) {
    tree = <AppProvider>{tree}</AppProvider>;
  }

  if (needsRouter) {
    tree = <MemoryRouter>{tree}</MemoryRouter>;
  }

  return tree;
};

const preview: Preview = {
  // Aplicados de fora para dentro: o tema (e o Toaster) envolve os
  // providers de aplicação.
  decorators: [withTheme, withAppProviders],
  globalTypes: {
    theme: {
      description: 'Tema da aplicação',
      defaultValue: 'light',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Claro' },
          { value: 'dark', icon: 'moon', title: 'Escuro' },
          { value: 'system', icon: 'browser', title: 'Sistema' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    // O ThemeProvider controla o fundo via tokens; o addon de backgrounds
    // brigaria com ele.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
