import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  component: Popover,
  tags: ['ai-generated'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensões</h4>
            <p className="text-sm text-muted-foreground">Defina a largura e a altura do elemento.</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvas, userEvent, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: /abrir popover/i });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const content = await body.findByText('Dimensões');
    await expect(content).toBeInTheDocument();
  },
};
