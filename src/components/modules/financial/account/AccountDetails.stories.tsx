import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccountType, CardType } from '@/schemas/enums';

import { AccountDetails } from './AccountDetails';

const meta = {
  title: 'Modules/Financial/AccountDetails',
  component: AccountDetails,
  parameters: { layout: 'padded' },
  args: {
    onEdit: () => {},
    onDelete: () => {},
    account: {
      bankAccountId: 'acc-1',
      name: 'Conta Corrente Nubank',
      type: AccountType.Checking,
      balance: 4820.55,
      initialBalance: 1000,
      color: '#8A05BE',
      paymentCards: [
        {
          paymentCardId: 'card-1',
          bankAccountId: 'acc-1',
          name: 'Nubank Ultravioleta',
          type: CardType.Credit,
          color: '#8A05BE',
          isActive: true,
        },
        {
          paymentCardId: 'card-2',
          bankAccountId: 'acc-1',
          name: 'Nubank Débito',
          type: CardType.Debit,
          color: '#5B21B6',
          isActive: false,
        },
      ],
    },
  },
} satisfies Meta<typeof AccountDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Saldo negativo usa `--destructive` em vez do verde `--chart-2`. */
export const NegativeBalance: Story = {
  args: {
    account: {
      ...meta.args.account,
      name: 'Conta Corrente Itaú',
      balance: -320.9,
      color: '#EC7000',
      paymentCards: [],
    },
  },
};

/** Sem cartões vinculados — mostra a mensagem de vazio da seção. */
export const NoLinkedCards: Story = {
  args: {
    account: { ...meta.args.account, paymentCards: [] },
  },
};

/** Nome longo deve truncar sem empurrar os botões de ação. */
export const LongName: Story = {
  args: {
    account: {
      ...meta.args.account,
      name: 'Conta Corrente Conjunta Família Carrijo Banco do Brasil',
    },
  },
};
