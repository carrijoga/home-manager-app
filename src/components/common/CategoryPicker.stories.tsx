import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CategoryPicker } from '@/components/common/CategoryPicker';
import { Label } from '@/components/ui/label';
import { CategoryScope } from '@/schemas/category';

const meta: Meta<typeof CategoryPicker> = {
  title: 'Common/CategoryPicker',
  component: CategoryPicker,
  parameters: { app: true },
};
export default meta;

type Story = StoryObj<typeof CategoryPicker>;

function Controlled({ scope }: { scope: CategoryScope }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="w-80 space-y-1.5">
      <Label htmlFor="picker">Categoria</Label>
      <CategoryPicker id="picker" scope={scope} value={value} onChange={setValue} allowClear />
      <p className="text-xs text-muted-foreground">Selecionado: {value ?? '—'}</p>
    </div>
  );
}

export const Despesas: Story = { render: () => <Controlled scope={CategoryScope.Expense} /> };
export const Compras: Story = { render: () => <Controlled scope={CategoryScope.Shopping} /> };
