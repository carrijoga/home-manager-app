import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { Calendar } from './calendar';

const meta = {
  component: Calendar,
  tags: ['ai-generated'],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return <Calendar mode="single" selected={new Date(2026, 8, 8)} className="rounded-md border shadow" />;
  },
  play: async ({ canvas }) => {
    // Calendar renders navigation buttons
    const nextBtn = canvas.getByRole('button', { name: /next/i });
    await expect(nextBtn).toBeInTheDocument();
  },
};
