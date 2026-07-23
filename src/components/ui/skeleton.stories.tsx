import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * `Skeleton` é só um bloco com `animate-pulse` — a forma vem das classes
 * de tamanho que você passar. Serve de placeholder enquanto os dados
 * carregam, no lugar de um spinner.
 */
const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[240px]" />,
};

/** Linhas de larguras diferentes imitam melhor um parágrafo real. */
export const TextLines: Story = {
  render: () => (
    <div className="w-[280px] space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[85%]" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[140px]" />
        <Skeleton className="h-3 w-[90px]" />
      </div>
    </div>
  ),
};

/** Placeholder espelhando o layout de um card de conta. */
export const CardPlaceholder: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-[160px]" />
        <Skeleton className="h-3 w-[110px]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-[140px]" />
        <Skeleton className="h-3 w-[180px]" />
      </CardContent>
    </Card>
  ),
};

export const ListPlaceholder: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-[70%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  ),
};
