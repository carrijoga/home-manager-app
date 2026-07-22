import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * O `AvatarFallback` aparece enquanto a imagem carrega e quando ela
 * falha — por isso a story `BrokenImage` cai nas iniciais em vez de
 * mostrar um ícone quebrado.
 */
const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Foto de Gabriel" />
      <AvatarFallback>GC</AvatarFallback>
    </Avatar>
  ),
};

/** Sem `AvatarImage` — o caso mais comum no app. */
export const Initials: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>GC</AvatarFallback>
    </Avatar>
  ),
};

/** URL inválida: o Radix troca para o fallback sozinho. */
export const BrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://exemplo.invalido/nao-existe.png" alt="" />
      <AvatarFallback>MC</AvatarFallback>
    </Avatar>
  ),
};

/** O tamanho vem de classes utilitárias — o padrão é `h-10 w-10`. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-[10px]">GC</AvatarFallback>
      </Avatar>
      <Avatar className="h-10 w-10">
        <AvatarFallback className="text-sm">GC</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarFallback className="text-lg">GC</AvatarFallback>
      </Avatar>
    </div>
  ),
};

/** Sobreposição usada para mostrar os membros de um ninho. */
export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {['GC', 'MC', 'AS', 'LP'].map((initials) => (
        <Avatar key={initials} className="border-background h-9 w-9 border-2">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
