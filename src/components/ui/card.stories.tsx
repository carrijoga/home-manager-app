import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * `Card` é a superfície base do app. Usa os tokens `bg-card` e
 * `text-card-foreground`, então é a story mais útil para conferir o
 * contraste ao alternar o tema na toolbar.
 */
const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>Conta Corrente</CardTitle>
        <CardDescription>Banco do Brasil</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">R$ 2.480,00</p>
        <p className="text-muted-foreground text-xs">Atualizado hoje às 14:32</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Ver extrato</Button>
        <Button size="sm" variant="outline">
          Editar
        </Button>
      </CardFooter>
    </Card>
  ),
};

/** Sem footer — o padrão para cards apenas informativos. */
export const Simple: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>Gastos do mês</CardTitle>
        <CardDescription>Julho de 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">R$ 1.135,90</p>
      </CardContent>
    </Card>
  ),
};

/** Só conteúdo, sem header — usado em tiles compactos. */
export const ContentOnly: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardContent className="pt-6">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">Saldo total</p>
        <p className="text-2xl font-semibold">R$ 8.712,45</p>
      </CardContent>
    </Card>
  ),
};

/** Várias superfícies juntas — confere o contraste de borda e sombra no tema escuro. */
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {['Mercado', 'Transporte', 'Lazer', 'Casa'].map((label) => (
        <Card key={label} className="w-[180px]">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
            <p className="text-lg font-semibold">R$ 320,00</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
