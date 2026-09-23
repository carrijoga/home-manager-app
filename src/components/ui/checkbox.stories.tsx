import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { disabled: false },
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox disabled />
      <Checkbox disabled defaultChecked />
    </div>
  ),
};

/**
 * O `htmlFor` do label apontando para o `id` do checkbox faz o texto
 * também alternar o estado ao ser clicado.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="lembrete" />
      <Label htmlFor="lembrete">Receber lembrete de vencimento</Label>
    </div>
  ),
};

/** Lista controlada — clique para marcar; o texto risca quando concluído. */
export const TaskList: Story = {
  render: function TaskListStory() {
    const [done, setDone] = useState<Record<string, boolean>>({
      mercado: true,
      louca: false,
      lixo: false,
    });

    const items = [
      { id: 'mercado', label: 'Fazer compras do mês' },
      { id: 'louca', label: 'Lavar a louça' },
      { id: 'lixo', label: 'Levar o lixo para fora' },
    ];

    return (
      <div className="w-[280px] space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              id={item.id}
              checked={done[item.id]}
              onCheckedChange={(v) => setDone((prev) => ({ ...prev, [item.id]: v === true }))}
            />
            <Label
              htmlFor={item.id}
              className={done[item.id] ? 'text-muted-foreground line-through' : ''}
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    );
  },
};
