import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import PostIt from '@/components/common/PostIt';

/**
 * Nota do quadro de avisos, no estilo post-it.
 *
 * A cor e a rotação são **derivadas do `noticeId`** por hash, não
 * sorteadas: o mesmo id rende sempre a mesma aparência. Notas fixadas
 * ignoram isso e usam sempre o tom pêssego. Os ids abaixo foram
 * escolhidos para cair em cores diferentes.
 *
 * Os botões de ação aparecem no hover (em telas touch ficam sempre
 * visíveis). Só o autor vê editar e excluir — passe um `currentUserId`
 * diferente de `createdBy` para ver a nota de outra pessoa.
 */
const meta = {
  title: 'Common/PostIt',
  component: PostIt,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'sun', 'blush', 'mint', 'sky', 'peach'],
    },
    isPinned: { control: 'boolean' },
    index: { table: { disable: true } },
  },
  args: {
    noticeId: 'a1',
    message: 'Não esquecer de pagar o condomínio até sexta!',
    date: '2026-07-23T10:00:00',
    isPinned: false,
    authorName: 'Gabriel',
    createdBy: 'user-1',
    currentUserId: 'user-1',
    onRemove: fn(),
    onPin: fn(),
    onUnpin: fn(),
    onEdit: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[220px] py-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostIt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Fixada: alfinete vermelho e tom pêssego, independente do id. */
export const Pinned: Story = {
  args: {
    isPinned: true,
    message: 'Reunião de condomínio no dia 30, às 19h.',
  },
};

/** Toda a paleta, forçada via `color`. */
export const Palette: Story = {
  decorators: [
    (Story) => (
      <div className="grid w-[720px] grid-cols-3 gap-6 py-6">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <PostIt {...args} noticeId="c1" color="sun" message="Amarelo — sun" />
      <PostIt {...args} noticeId="c2" color="blush" message="Rosa — blush" />
      <PostIt {...args} noticeId="c3" color="mint" message="Verde — mint" />
      <PostIt {...args} noticeId="c4" color="sky" message="Azul — sky" />
      <PostIt {...args} noticeId="c5" color="peach" message="Pêssego — peach" />
    </>
  ),
};

/** Com prazo de expiração — o rodapé mostra o tempo restante. */
export const WithExpiry: Story = {
  args: {
    noticeId: 'b2',
    message: 'Promoção do mercado acaba hoje à noite.',
    expiresAt: new Date(Date.now() + 5 * 3600_000).toISOString(),
  },
};

/** Prazo vencido: o rótulo vira "Expirado", em vermelho. */
export const Expired: Story = {
  args: {
    noticeId: 'b3',
    message: 'Entrega do boleto era ontem.',
    expiresAt: new Date(Date.now() - 3600_000).toISOString(),
  },
};

/**
 * Nota de outra pessoa: `createdBy` difere de `currentUserId`, então
 * editar e excluir somem — só fixar continua disponível.
 */
export const FromAnotherUser: Story = {
  args: {
    noticeId: 'b4',
    message: 'Deixei a chave reserva com o porteiro.',
    authorName: 'Marina',
    createdBy: 'user-2',
    currentUserId: 'user-1',
  },
};

/** Mensagem longa — o corpo cresce e o texto quebra. */
export const LongMessage: Story = {
  args: {
    noticeId: 'b5',
    message:
      'Lembrete: na próxima semana o síndico vai passar em todos os apartamentos para verificar os hidrômetros. Precisa ter alguém em casa entre 9h e 17h.',
  },
};

/** Várias notas juntas, como aparecem no quadro. */
export const Board: Story = {
  decorators: [
    (Story) => (
      <div className="grid w-[720px] grid-cols-3 gap-6 py-6">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <PostIt {...args} noticeId="d1" isPinned message="Reunião dia 30, 19h." index={0} />
      <PostIt {...args} noticeId="d2" message="Comprar ração para o gato." index={1} />
      <PostIt {...args} noticeId="d3" message="Consulta da Ana: quinta, 14h." authorName="Marina" index={2} />
    </>
  ),
};
