import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

/**
 * O `Spinner` usa `text-current`, então herda a cor de quem o contém —
 * é isso que faz ele funcionar dentro de um botão sem ajuste nenhum.
 */
const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: { size: 'md' },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

/** Herdando a cor do contexto. */
export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="text-primary" />
      <Spinner className="text-muted-foreground" />
      <Spinner className="text-destructive" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button disabled>
        <Spinner size="sm" />
        Salvando...
      </Button>
      <Button variant="outline" disabled>
        <Spinner size="sm" />
        Carregando
      </Button>
    </div>
  ),
};

export const Centered: Story = {
  render: () => (
    <div className="flex h-[160px] w-[280px] flex-col items-center justify-center gap-3 rounded-xl border">
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm text-muted-foreground">Carregando suas contas...</p>
    </div>
  ),
};
