import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import MoneyInput from '@/components/common/MoneyInput';
import { Label } from '@/components/ui/label';

/**
 * Entrada monetária em Real, sobre `react-number-format`: prefixo `R$`,
 * vírgula decimal, ponto no milhar e duas casas fixas.
 *
 * O valor sai como `number | null` — não como string formatada — então
 * quem consome recebe `1234.5`, e `null` quando o campo está vazio.
 */
const meta = {
  title: 'Common/MoneyInput',
  component: MoneyInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    className: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },
} satisfies Meta<typeof MoneyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Digite para ver a formatação sendo aplicada, e o valor cru abaixo. */
export const Default: Story = {
  args: { value: null, onChange: () => {} },
  render: function DefaultStory(args) {
    const [value, setValue] = useState<number | null>(args.value);
    return (
      <div className="w-[280px] space-y-2">
        <MoneyInput {...args} value={value} onChange={setValue} />
        <p className="text-muted-foreground text-xs">
          Valor: <code>{value === null ? 'null' : value}</code>
        </p>
      </div>
    );
  },
};

export const WithValue: Story = {
  args: { value: 1234.5, onChange: () => {} },
  render: function WithValueStory(args) {
    const [value, setValue] = useState<number | null>(args.value);
    return (
      <div className="w-[280px]">
        <MoneyInput {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithLabel: Story = {
  args: { value: null, onChange: () => {} },
  render: function WithLabelStory(args) {
    const [value, setValue] = useState<number | null>(args.value);
    return (
      <div className="w-[280px] space-y-1.5">
        <Label htmlFor="valor" className="text-muted-foreground text-xs uppercase tracking-wide">
          Valor da despesa
        </Label>
        <MoneyInput {...args} id="valor" value={value} onChange={setValue} />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { value: 89.9, disabled: true, onChange: () => {} },
  render: (args) => (
    <div className="w-[280px]">
      <MoneyInput {...args} />
    </div>
  ),
};

/** Valores grandes recebem o separador de milhar. */
export const LargeValue: Story = {
  args: { value: 1287450.99, onChange: () => {} },
  render: function LargeValueStory(args) {
    const [value, setValue] = useState<number | null>(args.value);
    return (
      <div className="w-[280px]">
        <MoneyInput {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};
