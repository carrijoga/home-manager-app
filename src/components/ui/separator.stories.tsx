import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from '@/components/ui/separator';

/**
 * `decorative` vem como `true`, o que esconde o separador de leitores de
 * tela — correto quando ele é só um traço visual. Passe `decorative={false}`
 * quando ele de fato separar duas seções distintas de conteúdo.
 */
const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[280px]">
      <p className="text-sm font-medium">Conta Corrente</p>
      <p className="text-xs text-muted-foreground">Banco do Brasil</p>
      <Separator className="my-3" />
      <p className="text-sm">R$ 2.480,00</p>
    </div>
  ),
};

/** Na vertical o pai precisa ter altura definida. */
export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-3 text-sm">
      <span>Tarefas</span>
      <Separator orientation="vertical" />
      <span>Compras</span>
      <Separator orientation="vertical" />
      <span>Financeiro</span>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-[280px]">
      {['Mercado', 'Farmácia', 'Transporte'].map((label, i, arr) => (
        <div key={label}>
          <div className="flex items-center justify-between py-2 text-sm">
            <span>{label}</span>
            <span className="text-muted-foreground">R$ 120,00</span>
          </div>
          {i < arr.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  ),
};
