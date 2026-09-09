import type { TourDefinition } from '@/types/onboarding';

export const dashboardTour: TourDefinition = {
  id: 'dashboard',
  title: 'Tour do Painel Principal',
  steps: [
    {
      target: '[data-tour="dashboard-header"]',
      title: 'Bem-vindo ao seu Ninho! 🏠',
      description:
        'Aqui você tem uma visão rápida do clima, quem está online na casa e o resumo das atividades.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="dashboard-metrics"]',
      title: 'Métricas e Visão Geral 📊',
      description:
        'Acompanhe os principais indicadores da casa, como tarefas pendentes, despesas do mês e itens de compras.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="dashboard-bulletin"]',
      title: 'Mural de Avisos 📌',
      description:
        'Deixe recados, lembretes importantes e post-its interativos com reações para toda a família ver.',
      placement: 'top',
    },
    {
      target: '[data-tour="dashboard-tasks"]',
      title: 'Tarefas Rápidas do Dia ✅',
      description:
        'Veja o que precisa de atenção urgente hoje e marque como concluído com apenas um clique.',
      placement: 'top',
    },
  ],
};
