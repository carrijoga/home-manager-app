import type { Meta, StoryObj } from '@storybook/react-vite';
import { PiggyBank, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';

import MetricCard from '@/components/common/MetricCard';

/**
 * Card de métrica do Dashboard: ícone, valor, comparação com o período
 * anterior e mini gráfico de tendência opcional.
 *
 * A entrada é animada (Framer Motion) com `animationDelay` — em uma
 * grade, escalonar o delay produz o efeito de cascata.
 */
const meta = {
  title: 'Common/MetricCard',
  component: MetricCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['terracotta', 'honey', 'sage', 'sky', 'blush'],
    },
    alertType: {
      control: 'select',
      options: [undefined, 'success', 'warning', 'danger', 'info'],
    },
    animationDelay: { control: { type: 'number', min: 0, max: 2, step: 0.1 } },
    icon: { table: { disable: true } },
    footer: { table: { disable: true } },
    chartData: { table: { disable: true } },
    color: { table: { disable: true } },
  },
  args: {
    icon: Wallet,
    title: 'Saldo total',
    value: 'R$ 8.712,45',
    tone: 'terracotta',
    animationDelay: 0,
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Os cinco tons semânticos. */
export const Tones: Story = {
  decorators: [
    (Story) => (
      <div className="grid w-[600px] grid-cols-2 gap-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <MetricCard {...args} tone="terracotta" title="Terracotta" icon={Wallet} />
      <MetricCard {...args} tone="honey" title="Honey" icon={PiggyBank} />
      <MetricCard {...args} tone="sage" title="Sage" icon={TrendingUp} />
      <MetricCard {...args} tone="sky" title="Sky" icon={Receipt} />
      <MetricCard {...args} tone="blush" title="Blush" icon={ShoppingCart} />
    </>
  ),
};

/** Alta em relação ao mês anterior — seta e valor em sage. */
export const PositiveComparison: Story = {
  args: {
    icon: TrendingUp,
    title: 'Receitas do mês',
    value: 'R$ 5.400,00',
    tone: 'sage',
    comparison: { value: 12 },
  },
};

/** Queda — seta e valor em terracotta. */
export const NegativeComparison: Story = {
  args: {
    icon: Receipt,
    title: 'Gastos do mês',
    value: 'R$ 1.135,90',
    tone: 'terracotta',
    comparison: { value: -8 },
  },
};

/** Comparação zerada cai no rótulo neutro. */
export const NeutralComparison: Story = {
  args: {
    comparison: { value: 0, label: 'vs semana passada' },
  },
};

/** Com mini gráfico de tendência (Recharts). */
export const WithChart: Story = {
  args: {
    icon: TrendingUp,
    title: 'Gastos por semana',
    value: 'R$ 320,00',
    tone: 'honey',
    comparison: { value: 5 },
    chartData: [
      { value: 240 }, { value: 300 }, { value: 280 },
      { value: 360 }, { value: 320 }, { value: 400 }, { value: 320 },
    ],
  },
};

/** A faixa superior colorida vem de `alertType`. */
export const AlertTypes: Story = {
  decorators: [
    (Story) => (
      <div className="grid w-[600px] grid-cols-2 gap-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <MetricCard {...args} alertType="success" title="Success" tone="sage" />
      <MetricCard {...args} alertType="warning" title="Warning" tone="honey" />
      <MetricCard {...args} alertType="danger" title="Danger" tone="terracotta" />
      <MetricCard {...args} alertType="info" title="Info" tone="sky" />
    </>
  ),
};

/** `footer` aceita qualquer ReactNode, separado por uma borda. */
export const WithFooter: Story = {
  args: {
    icon: PiggyBank,
    title: 'Meta de economia',
    value: 'R$ 2.000,00',
    tone: 'sage',
    footer: (
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Faltam</span>
        <span className="font-semibold">R$ 480,00</span>
      </div>
    ),
  },
};

/** Delays escalonados — a cascata que o Dashboard usa. */
export const StaggeredGrid: Story = {
  decorators: [
    (Story) => (
      <div className="grid w-[600px] grid-cols-2 gap-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <MetricCard {...args} title="Saldo" tone="terracotta" icon={Wallet} animationDelay={0} />
      <MetricCard {...args} title="Receitas" tone="sage" icon={TrendingUp} animationDelay={0.1} />
      <MetricCard {...args} title="Despesas" tone="honey" icon={Receipt} animationDelay={0.2} />
      <MetricCard {...args} title="Compras" tone="blush" icon={ShoppingCart} animationDelay={0.3} />
    </>
  ),
};
