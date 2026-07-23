import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { BulletinNote } from '@/components/common/BulletinBoard';
import { BulletinBoard } from '@/components/common/BulletinBoard';
import { ApiPriority } from '@/types';

/**
 * Mural de recados da família. As notas entram em cascata
 * (`staggerChildren`), e cada uma recebe borda e fundo derivados da
 * prioridade — urgente puxa `--chart-4`, as demais `--chart-5`.
 *
 * O grid é fixo em 3 colunas, então o mural quer largura: as stories
 * abaixo reservam 900px.
 */
const meta = {
  title: 'Common/BulletinBoard',
  component: BulletinBoard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    notes: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  args: {
    onCreateNote: fn(),
    onTogglePin: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[900px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BulletinBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

const notes: BulletinNote[] = [
  {
    id: '1',
    priority: ApiPriority.Urgente,
    content: 'O portão da garagem está com defeito — não deixem fechar sozinho.',
    isPinned: true,
    authorName: 'Gabriel',
    timeLabel: 'Há 2 horas',
    reactions: [{ emoji: '👍', count: 3 }],
  },
  {
    id: '2',
    priority: ApiPriority.Alta,
    content: 'Consulta da Ana foi remarcada para quinta, às 14h.',
    authorName: 'Marina',
    timeLabel: 'Ontem',
  },
  {
    id: '3',
    priority: ApiPriority.Media,
    content: 'Comprei ração para o gato — dá até o fim do mês.',
    authorName: 'Gabriel',
    timeLabel: 'Há 3 dias',
    reactions: [
      { emoji: '🐱', count: 2 },
      { emoji: '❤️', count: 1 },
    ],
  },
];

export const Default: Story = {
  args: { notes },
};

/** Sem recados — o estado de quem acabou de criar o ninho. */
export const Empty: Story = {
  args: { notes: [] },
};

/** Sem `onCreateNote` o botão "Criar Nota" não é renderizado. */
export const ReadOnly: Story = {
  args: {
    notes,
    onCreateNote: undefined,
  },
};

/** As quatro prioridades lado a lado. */
export const Priorities: Story = {
  args: {
    notes: [
      { id: 'p0', priority: ApiPriority.Urgente, content: 'Urgente', authorName: 'Gabriel', timeLabel: 'Agora' },
      { id: 'p1', priority: ApiPriority.Alta, content: 'Alta', authorName: 'Gabriel', timeLabel: 'Agora' },
      { id: 'p2', priority: ApiPriority.Media, content: 'Média', authorName: 'Gabriel', timeLabel: 'Agora' },
      { id: 'p3', priority: ApiPriority.Baixa, content: 'Baixa', authorName: 'Gabriel', timeLabel: 'Agora' },
    ],
  },
};

/** Uma nota só — o grid de 3 colunas deixa as outras vazias. */
export const SingleNote: Story = {
  args: {
    notes: [notes[0]],
  },
};

/** Muitas notas: a cascata fica evidente e o grid quebra em linhas. */
export const ManyNotes: Story = {
  args: {
    notes: [
      ...notes,
      { id: '4', priority: ApiPriority.Baixa, content: 'Trocar a lâmpada do corredor.', authorName: 'Marina', timeLabel: 'Há 4 dias' },
      { id: '5', priority: ApiPriority.Media, content: 'Reunião de condomínio dia 30, às 19h.', authorName: 'Gabriel', timeLabel: 'Há 5 dias' },
      { id: '6', priority: ApiPriority.Alta, content: 'Boleto do seguro vence sexta.', authorName: 'Marina', timeLabel: 'Há 1 semana' },
    ],
  },
};

/** Texto longo dentro de uma coluna estreita. */
export const LongContent: Story = {
  args: {
    notes: [
      {
        id: 'long',
        priority: ApiPriority.Alta,
        content:
          'Na próxima semana o síndico vai passar em todos os apartamentos para verificar os hidrômetros. Precisa ter alguém em casa entre 9h e 17h — se ninguém puder, avisar na portaria para remarcar.',
        authorName: 'Gabriel',
        timeLabel: 'Há 1 hora',
      },
      ...notes.slice(1),
    ],
  },
};
