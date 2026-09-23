import type { TourDefinition } from '@/types/onboarding';

export const tasksTour: TourDefinition = {
  id: 'tasks',
  title: 'Tour do Gerenciador de Tarefas',
  steps: [
    {
      target: '[data-tour="tasks-header"]',
      title: 'Quadro de Tarefas do Ninho 📋',
      description:
        'Organize os afazeres da casa, limpezas, manutenções e compromissos divididos por colunas.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="tasks-create-button"]',
      title: 'Criar Nova Tarefa ➕',
      description:
        'Adicione uma nova tarefa, defina data limite, nível de prioridade e atribua a um membro da família.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="tasks-filters"]',
      title: 'Filtros e Busca 🔍',
      description:
        'Filtre tarefas por responsável, categoria (Limpeza, Manutenção, etc.) ou urgência para focar no que importa.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="tasks-board"]',
      title: 'Fluxo Kanban Interativo 🔄',
      description:
        'Acompanhe o status entre "A Fazer", "Em Andamento" e "Concluído", arrastando ou clicando nas ações.',
      placement: 'top',
    },
  ],
};
