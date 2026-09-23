import type { TourDefinition } from '@/types/onboarding';

export const shoppingTour: TourDefinition = {
  id: 'shopping',
  title: 'Tour da Lista de Compras',
  steps: [
    {
      target: '[data-tour="shopping-header"]',
      title: 'Lista de Compras Compartilhada 🛒',
      description:
        'Crie listas de mercado, feira, farmácia ou itens gerais compartilhadas em tempo real com todos da casa.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="shopping-add-button"]',
      title: 'Adicionar Itens ➕',
      description:
        'Insira produtos com quantidade, categoria, valor estimado ou notas adicionais.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="shopping-lists-container"]',
      title: 'Itens por Categoria e Check 📦',
      description:
        'Conforme for colocando os produtos no carrinho no supermercado, basta clicar para marcar como comprado.',
      placement: 'top',
    },
  ],
};
