import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Todo tooltip precisa de um `TooltipProvider` acima na árvore — no app
 * ele fica na raiz; aqui cada story traz o seu.
 *
 * Passe o mouse sobre o gatilho (ou dê Tab até ele) para abrir.
 */
const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Passe o mouse</Button>
        </TooltipTrigger>
        <TooltipContent>Detalhes da conta</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

/**
 * O padrão do projeto para explicar um campo obrigatório não óbvio:
 * `HelpCircle` com `size={14}` e `aria-label` no gatilho.
 * Ver o campo de conta vinculada em `PaymentCardSheet`.
 */
export const FieldHelp: Story = {
  render: () => (
    <TooltipProvider>
      <div className="w-[280px] space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="conta" className="text-xs uppercase tracking-wide text-muted-foreground">
            Conta vinculada
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Por que a conta vinculada é obrigatória?"
                className="text-muted-foreground hover:text-foreground"
              >
                <HelpCircle size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px]">
              As faturas do cartão são debitadas desta conta.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="h-9 rounded-md border border-border/40 bg-muted/30" />
      </div>
    </TooltipProvider>
  ),
};

/** O tooltip evita sair da viewport, então o lado é uma preferência. */
export const Sides: Story = {
  render: () => (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-4">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                {side}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>Lado {side}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};

/** `delayDuration={0}` abre na hora, sem a espera padrão. */
export const NoDelay: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Abre imediatamente</Button>
        </TooltipTrigger>
        <TooltipContent>Sem atraso</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
