import type { TourDefinition } from '@/types/onboarding';

export const financialTour: TourDefinition = {
  id: 'financial',
  title: 'Tour da Gestão Financeira',
  steps: [
    {
      target: '[data-tour="financial-header"]',
      title: 'Finanças do Lar 💰',
      description:
        'Controle o orçamento familiar, entradas, contas fixas, cartões de crédito e metas conjuntas.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="financial-summary"]',
      title: 'Resumo e Balanço Mensal 📈',
      description:
        'Veja a receita total, despesas realizadas e o saldo disponível para o mês selecionado.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="financial-action-buttons"]',
      title: 'Nova Transação ➕',
      description:
        'Lance rapidamente receitas ou despesas, selecione a categoria, data e forma de pagamento.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="financial-tabs"]',
      title: 'Módulos Financeiros 💳',
      description:
        'Navegue entre o Extrato Geral, Cartões de Crédito, Metas de Poupança e Despesas Recorrentes.',
      placement: 'bottom',
    },
  ],
};
