import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Receipt, ShoppingBasket, WifiOff } from 'lucide-react';

import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Common/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { table: { disable: true } },
    action: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  args: {
    title: 'Nenhuma despesa por aqui',
    description: 'As despesas que você registrar aparecem nesta lista.',
    icon: Receipt,
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Só o título — `icon` e `description` são opcionais. */
export const TitleOnly: Story = {
  args: {
    icon: undefined,
    description: undefined,
  },
};

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
  },
};

/** `action` aceita qualquer ReactNode — normalmente o próximo passo do usuário. */
export const WithAction: Story = {
  args: {
    icon: ShoppingBasket,
    title: 'Sua lista está vazia',
    description: 'Adicione o primeiro item para começar as compras.',
    action: (
      <Button size="sm">
        <Plus />
        Adicionar item
      </Button>
    ),
  },
};

/** Textos longos: a descrição é limitada a `max-w-[200px]` e quebra em várias linhas. */
export const LongText: Story = {
  args: {
    icon: WifiOff,
    title: 'Não foi possível carregar suas informações',
    description:
      'Verifique sua conexão com a internet e tente novamente. Se o problema persistir, aguarde alguns minutos.',
    action: (
      <Button size="sm" variant="outline">
        Tentar novamente
      </Button>
    ),
  },
};
