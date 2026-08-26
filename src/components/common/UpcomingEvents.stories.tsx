import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { UpcomingEvents } from '@/components/common/UpcomingEvents';

/**
 * O botão "Abrir Agenda" usa `useNavigate`, então as stories envolvem o
 * componente num `MemoryRouter` — sem ele o React Router lança erro. A
 * navegação não sai do lugar aqui, o que é o esperado em isolamento.
 */
const meta = {
  title: 'Common/UpcomingEvents',
  component: UpcomingEvents,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[320px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  argTypes: {
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof UpcomingEvents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    events: [
      {
        id: '1',
        dateLabel: 'Amanhã • 10:00',
        title: 'Consulta pediatra',
        location: 'Clínica Vida',
        isNext: true,
      },
      {
        id: '2',
        dateLabel: 'Quinta • 19:30',
        title: 'Jantar em família',
        location: 'Casa da vovó',
      },
      {
        id: '3',
        dateLabel: 'Sábado • 08:00',
        title: 'Feira livre',
      },
    ],
  },
};

/** Sem eventos — o estado inicial de quem acabou de criar o ninho. */
export const Empty: Story = {
  args: { events: [] },
};

/** Um único evento, destacado como o próximo. */
export const SingleEvent: Story = {
  args: {
    events: [
      {
        id: '1',
        dateLabel: 'Hoje • 18:00',
        title: 'Reunião de condomínio',
        location: 'Salão de festas',
        isNext: true,
      },
    ],
  },
};

/** Títulos e locais longos são truncados com `truncate`. */
export const LongTitles: Story = {
  args: {
    events: [
      {
        id: '1',
        dateLabel: 'Amanhã • 14:00',
        title: 'Reunião de pais e mestres do segundo semestre letivo',
        location: 'Escola Municipal Professora Maria da Conceição Silva',
        isNext: true,
      },
      {
        id: '2',
        dateLabel: 'Sexta • 09:00',
        title: 'Manutenção preventiva do ar-condicionado da sala',
        location: 'Apartamento 402',
      },
    ],
  },
};
