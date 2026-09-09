import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { FamilyGoalCard } from './FamilyGoalCard';

const meta = {
  component: FamilyGoalCard,
  tags: ['ai-generated'],
} satisfies Meta<typeof FamilyGoalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGoals = [
  {
    id: 'goal-1',
    categoryLabel: 'Reserva',
    title: 'Fundo de Emergência',
    progress: 0.75,
    remainingLabel: 'Faltam R$ 2.500 de R$ 10.000',
  },
  {
    id: 'goal-2',
    categoryLabel: 'Lazer',
    title: 'Viagem de Férias',
    progress: 0.4,
    remainingLabel: 'Faltam R$ 3.000 de R$ 5.000',
  },
];

export const Default: Story = {
  args: {
    goals: mockGoals,
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('Fundo de Emergência')).toBeInTheDocument();
    await expect(canvas.getByText('75%')).toBeInTheDocument();

    const nextButton = canvas.getByRole('button', { name: /próxima/i });
    await userEvent.click(nextButton);
    await expect(canvas.getByText('Viagem de Férias')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    goals: [],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Sem metas definidas ainda.')).toBeInTheDocument();
  },
};
