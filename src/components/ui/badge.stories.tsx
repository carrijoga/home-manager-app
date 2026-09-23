import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warm'],
    },
  },
  args: {
    children: 'Pendente',
    variant: 'default',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `success` (sage) e `warm` (terracotta) são variants próprias do Ninho. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} variant="default">
        Padrão
      </Badge>
      <Badge {...args} variant="secondary">
        Secundário
      </Badge>
      <Badge {...args} variant="success">
        Pago
      </Badge>
      <Badge {...args} variant="warm">
        Warm
      </Badge>
      <Badge {...args} variant="outline">
        Outline
      </Badge>
      <Badge {...args} variant="destructive">
        Atrasado
      </Badge>
    </div>
  ),
};

/** Uso típico: status de uma despesa. */
export const StatusExamples: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <Badge variant="success">Pago</Badge>
      <Badge variant="destructive">Vencido</Badge>
      <Badge variant="secondary">Agendado</Badge>
      <Badge variant="outline">Rascunho</Badge>
    </div>
  ),
};
