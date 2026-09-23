import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

const meta = {
  component: Accordion,
  tags: ['ai-generated'],
  args: {
    type: 'single',
    collapsible: true,
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Como funciona o Ninho?</AccordionTrigger>
        <AccordionContent>
          O Ninho organiza despesas, compras e tarefas em família de forma simples e colaborativa.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Posso convidar outros membros?</AccordionTrigger>
        <AccordionContent>
          Sim, você pode convidar qualquer pessoa por e-mail ou código de convite familiar.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /Como funciona o Ninho\?/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/organiza despesas, compras e tarefas/i)).toBeInTheDocument();
  },
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="sec-1">
        <AccordionTrigger>Módulo Financeiro</AccordionTrigger>
        <AccordionContent>Gerencie transações, cartões de crédito e contas bancárias.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="sec-2">
        <AccordionTrigger>Módulo de Tarefas</AccordionTrigger>
        <AccordionContent>Acompanhe pendências domésticas atribuídas aos membros.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
