import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'warm'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
  },
  args: {
    children: 'Salvar',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Todas as variants lado a lado — `warm` é específica do Ninho. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">
        Padrão
      </Button>
      <Button {...args} variant="secondary">
        Secundário
      </Button>
      <Button {...args} variant="warm">
        Warm
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="destructive">
        Excluir
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">
        Pequeno
      </Button>
      <Button {...args} size="default">
        Padrão
      </Button>
      <Button {...args} size="lg">
        Grande
      </Button>
      <Button {...args} size="icon" aria-label="Adicionar">
        <Plus />
      </Button>
    </div>
  ),
};

/** O `[&_svg]:size-4` do buttonVariants dimensiona o ícone automaticamente. */
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Plus />
        Nova conta
      </Button>
      <Button {...args} variant="destructive">
        <Trash2 />
        Excluir
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};
