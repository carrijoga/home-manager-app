import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  component: Select,
  tags: ['ai-generated'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione um módulo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Módulos</SelectLabel>
          <SelectItem value="dashboard">Dashboard</SelectItem>
          <SelectItem value="financial">Financeiro</SelectItem>
          <SelectItem value="tasks">Tarefas</SelectItem>
          <SelectItem value="shopping">Compras</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvas, userEvent, canvasElement }) => {
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const item = await body.findByText('Financeiro');
    await expect(item).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Desabilitado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhum</SelectItem>
      </SelectContent>
    </Select>
  ),
};
