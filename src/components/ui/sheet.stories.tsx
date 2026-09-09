import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Button } from './button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  component: Sheet,
  tags: ['ai-generated'],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Lateral</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Painel Lateral</SheetTitle>
          <SheetDescription>Configurações e detalhes adicionais da sua família.</SheetDescription>
        </SheetHeader>
        <div className="py-4 text-sm text-muted-foreground">
          Conteúdo customizado dentro do drawer lateral.
        </div>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvas, userEvent, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: /abrir lateral/i });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const title = await body.findByRole('heading', { name: /painel lateral/i });
    await expect(title).toBeInTheDocument();
  },
};
