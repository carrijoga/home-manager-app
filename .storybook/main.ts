import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  env: (env) => ({
    ...env,
    // Stories nunca devem falar com a API real. Os serviços já usam
    // 'mock' como padrão, mas fixar aqui torna isso explícito e imune a
    // um .env local com VITE_DATA_MODE=api.
    VITE_DATA_MODE: 'mock',
  }),
};

export default config;
