import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    rows: { control: { type: 'number', min: 2, max: 12 } },
  },
  args: {
    placeholder: 'Escreva um recado para a família...',
    disabled: false,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Textarea {...args} className="w-[320px]" />,
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="w-[320px] space-y-1.5">
      <Label htmlFor="recado" className="text-xs uppercase tracking-wide text-muted-foreground">
        Observações
      </Label>
      <Textarea {...args} id="recado" className="border-border/40 bg-muted/30" />
    </div>
  ),
};

export const Filled: Story = {
  args: {
    defaultValue:
      'Lembrar de comprar ração para o gato e passar na farmácia antes de voltar para casa.',
  },
  render: (args) => <Textarea {...args} className="w-[320px]" />,
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Não editável' },
  render: (args) => <Textarea {...args} className="w-[320px]" />,
};

/** `rows` define a altura inicial. */
export const Rows: Story = {
  render: (args) => (
    <div className="w-[320px] space-y-3">
      <Textarea {...args} rows={2} placeholder="2 linhas" />
      <Textarea {...args} rows={6} placeholder="6 linhas" />
    </div>
  ),
};
