import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'date'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Digite aqui...',
    type: 'text',
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Input {...args} className="w-[280px]" />,
};

/**
 * Campo com label, seguindo as convenções de formulário do projeto:
 * label em uppercase e input com `bg-muted/30 border-border/40`.
 */
export const WithLabel: Story = {
  render: (args) => (
    <div className="w-[280px] space-y-1.5">
      <Label htmlFor="nome" className="text-xs uppercase tracking-wide text-muted-foreground">
        Nome da conta
      </Label>
      <Input
        {...args}
        id="nome"
        placeholder="Ex: Conta Corrente"
        className="border-border/40 bg-muted/30"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Não editável' },
  render: (args) => <Input {...args} className="w-[280px]" />,
};

/** Ícone posicionado por cima do input, padrão usado na busca. */
export const WithIcon: Story = {
  render: (args) => (
    <div className="relative w-[280px]">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <Input {...args} placeholder="Buscar..." className="pl-9" />
    </div>
  ),
};

export const Types: Story = {
  render: (args) => (
    <div className="w-[280px] space-y-3">
      <Input {...args} type="text" placeholder="Texto" />
      <Input {...args} type="email" placeholder="email@exemplo.com" />
      <Input {...args} type="password" placeholder="Senha" />
      <Input {...args} type="number" placeholder="0" />
      <Input {...args} type="date" />
    </div>
  ),
};
