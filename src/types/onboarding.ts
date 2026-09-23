export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface TourStep {
  /** Seletor CSS ou atributo data-tour do elemento alvo. Ex: '[data-tour="dashboard-nests"]' */
  target: string;
  /** Título do passo */
  title: string;
  /** Descrição explicativa do passo */
  description: string;
  /** Posição preferida do tooltip em relação ao elemento alvo */
  placement?: TourPlacement;
  /** Padding opcional em pixels ao redor do elemento em foco (padrão: 8px) */
  padding?: number;
}

export interface TourDefinition {
  /** Identificador único do tour (ex: 'dashboard', 'tasks', 'financial', 'shopping') */
  id: string;
  /** Nome amigável do tour */
  title: string;
  /** Passos do tour */
  steps: TourStep[];
}

export interface OnboardingState {
  hasCompletedInitial: boolean;
  completedTours: Record<string, boolean>;
}

export interface OnboardingContextValue {
  hasCompletedInitial: boolean;
  completedTours: Record<string, boolean>;
  isInitialModalOpen: boolean;
  activeTour: TourDefinition | null;
  currentStepIndex: number;
  currentStep: TourStep | null;

  // Ações do Onboarding Inicial
  openInitialModal: () => void;
  closeInitialModal: () => void;
  completeInitial: () => void;

  // Ações do Tour por Tela
  startTour: (tourId: string, force?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: (tourId: string) => void;
  resetAll: () => void;
}
