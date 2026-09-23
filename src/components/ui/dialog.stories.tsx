import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  component: Dialog,
  tags: ['ai-generated'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Editar Perfil</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>Faça alterações no seu perfil familiar aqui.</DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">
          Conteúdo do formulário de perfil...
        </div>
        <DialogFooter>
          <Button type="button">Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas, userEvent, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: /editar perfil/i });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const dialogTitle = await body.findByRole('heading', { name: /editar perfil/i });
    await expect(dialogTitle).toBeInTheDocument();
  },
};
