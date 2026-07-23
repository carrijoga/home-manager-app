import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckSquare, ShoppingBasket, Wallet } from 'lucide-react';
import { fn } from 'storybook/test';

import { ModuleMetricWidget } from '@/components/common/ModuleMetricWidget';

/**
 * Widget de resumo de um módulo no Dashboard: ícone, categoria, valor
 * principal, até dois pares de rodapé e uma barra de progresso opcional.
 *
 * A barra é o único elemento animado — cresce de 0 até `progress` na
 * montagem, com um pequeno atraso.
 *
 * Com `onClick` o card vira um botão de verdade (`role="button"`,
 * `tabIndex`, Enter) e ganha estados de hover e foco.
 */
const meta = {
  title: 'Common/ModuleMetricWidget',
  component: ModuleMetricWidget,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    icon: { table: { disable: true } },
    footer: { table: { disable: true } },
    extra: { table: { disable: true } },
    onClick: { table: { disable: true } },
  },
  args: {
    icon: <Wallet size={24} strokeWidth={1.5} />,
    iconColor: 'var(--chart-2)',
    category: 'Financeiro',
    label: 'Gastos do mês',
    value: 'R$ 1.135,90',
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModuleMetricWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Com os dois pares de rodapé — o segundo alinha à direita. */
export const WithFooter: Story = {
  args: {
    footer: [
      { label: 'Receitas', value: 'R$ 5.400', valueColor: 'var(--chart-2)' },
      { label: 'Despesas', value: 'R$ 1.135', valueColor: 'var(--chart-4)' },
    ],
  },
};

/** Barra de progresso animada, com rótulo. */
export const WithProgress: Story = {
  args: {
    icon: <CheckSquare size={24} strokeWidth={1.5} />,
    category: 'Tarefas',
    label: 'Concluídas nesta semana',
    value: '7 de 10',
    progress: 0.7,
    progressLabel: '70%',
  },
};

/** Rodapé e progresso juntos — o layout mais completo. */
export const Complete: Story = {
  args: {
    icon: <ShoppingBasket size={24} strokeWidth={1.5} />,
    iconColor: 'var(--chart-5)',
    category: 'Compras',
    label: 'Lista da semana',
    value: '12 itens',
    footer: [
      { label: 'Comprados', value: '8' },
      { label: 'Estimado', value: 'R$ 240' },
    ],
    progress: 0.66,
    progressColor: 'var(--chart-5)',
    progressLabel: '66%',
  },
};

/** Progresso zerado e completo — os extremos da barra. */
export const ProgressExtremes: Story = {
  decorators: [
    (Story) => (
      <div className="grid w-[620px] grid-cols-2 gap-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <ModuleMetricWidget {...args} label="Nada feito ainda" value="0 de 8" progress={0} progressLabel="0%" />
      <ModuleMetricWidget {...args} label="Tudo concluído" value="8 de 8" progress={1} progressLabel="100%" />
    </>
  ),
};

/** Clicável: role de botão, hover e foco por teclado. */
export const Clickable: Story = {
  args: {
    onClick: fn(),
    label: 'Toque para abrir o módulo',
  },
};

/** Valor longo é truncado em uma linha. */
export const LongValue: Story = {
  args: {
    label: 'Descrição extensa da métrica',
    value: 'R$ 1.287.450,99 acumulados no ano',
  },
};
