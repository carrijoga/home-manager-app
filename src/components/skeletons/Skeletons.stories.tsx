import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  AccountSkeleton,
  AuthSkeleton,
  CalendarSkeleton,
  CardSkeleton,
  DashboardSkeleton,
  ExpenseListSkeleton,
  FinancialSkeleton,
  MetricCardSkeleton,
  PaymentCardSkeleton,
  ShoppingListSkeleton,
  TaskListSkeleton,
} from './index';

/**
 * Visualização e auditoria das animações de skeleton do NinhoApp.
 *
 * Cada story renderiza um skeleton fiel ao layout real do módulo,
 * com o efeito Shimmer Wave acelerado por GPU e suporte dinâmico a Light / Dark mode.
 */
const meta = {
  title: 'Skeletons/AppSkeletons',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Skeleton completo da página inicial (DashboardV2): Header, Clima, Membros, 3 Hero Widgets e Bento Grid */
export const Dashboard: Story = {
  render: () => (
    <div className="max-w-7xl mx-auto py-2">
      <DashboardSkeleton />
    </div>
  ),
};

/** Skeleton completo da página financeira (FinancialV2): 4 KPIs, MonthNavigator, gráfico analítico e extrato */
export const Financial: Story = {
  render: () => (
    <div className="max-w-7xl mx-auto py-2">
      <FinancialSkeleton />
    </div>
  ),
};

/** Skeleton do gerenciador de contas bancárias: Header com ações, HUD de saldo total, pílulas e grid de contas */
export const BankAccounts: Story = {
  render: () => (
    <div className="max-w-6xl mx-auto py-2">
      <AccountSkeleton />
    </div>
  ),
};

/** Skeleton do gerenciador de cartões de crédito: Header, HUD de limites, pílulas e grid de cartões */
export const CreditCards: Story = {
  render: () => (
    <div className="max-w-6xl mx-auto py-2">
      <PaymentCardSkeleton />
    </div>
  ),
};

/** Skeleton da lista de tarefas pendentes com metadados e tags */
export const TaskList: Story = {
  render: () => (
    <div className="max-w-xl mx-auto py-2">
      <TaskListSkeleton items={5} />
    </div>
  ),
};

/** Skeleton das listas de compras do lar */
export const ShoppingList: Story = {
  render: () => (
    <div className="max-w-xl mx-auto py-2">
      <ShoppingListSkeleton items={5} />
    </div>
  ),
};

/** Skeleton da lista de despesas e extrato */
export const ExpenseList: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto py-2">
      <ExpenseListSkeleton items={5} />
    </div>
  ),
};

/** Skeleton da visualização de calendário / agenda mensal */
export const Calendar: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto py-2">
      <CalendarSkeleton />
    </div>
  ),
};

/** Skeleton da tela de autenticação / login e cadastro */
export const Auth: Story = {
  render: () => (
    <div className="max-w-md mx-auto py-6">
      <AuthSkeleton />
    </div>
  ),
};

/** Skeleton de cards métricos individuais */
export const MetricCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto py-2">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  ),
};

/** Skeleton de card genérico de conteúdo */
export const GenericCard: Story = {
  render: () => (
    <div className="max-w-md mx-auto py-2">
      <CardSkeleton />
    </div>
  ),
};
