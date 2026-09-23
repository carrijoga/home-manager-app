import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { Label } from './label';

const meta = {
  component: Label,
  tags: ['ai-generated'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Nome completo',
  },
  play: async ({ canvas }) => {
    const label = canvas.getByText('Nome completo');
    await expect(label).toBeInTheDocument();
  },
};

export const Required: Story = {
  args: {
    children: 'E-mail *',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Campo desabilitado',
    className: 'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  },
};

export const CssCheck: Story = {
  args: {
    children: 'Verificação de Estilo',
  },
  play: async ({ canvas }) => {
    const label = canvas.getByText('Verificação de Estilo');
    // text-sm -> 14px, font-medium -> 500: comprova que o Tailwind foi carregado no iframe do Storybook
    await expect(getComputedStyle(label).fontWeight).toBe('500');
    await expect(getComputedStyle(label).fontSize).toBe('14px');
  },
};
