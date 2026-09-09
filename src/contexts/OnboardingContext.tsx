import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

import { getTourById } from '@/components/onboarding/tours';
import { useApp } from '@/contexts/AppContext';
import {
  fetchOnboardingState,
  getLocalOnboardingState,
  saveLocalOnboardingState,
  syncCompleteInitial,
  syncCompleteTour,
  syncResetTour,
} from '@/services/onboardingService';
import type {
  OnboardingContextValue,
  OnboardingState,
  TourDefinition,
} from '@/types/onboarding';

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, sessionChecked } = useApp();
  const location = useLocation();

  const [state, setState] = useState<OnboardingState>(() =>
    getLocalOnboardingState(user?.id)
  );
  const [isInitialModalOpen, setIsInitialModalOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<TourDefinition | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Carrega o estado ao trocar de usuário ou autenticar
  useEffect(() => {
    if (!user || !sessionChecked) return;

    let isMounted = true;
    fetchOnboardingState(user.id).then((serverOrLocalState) => {
      if (!isMounted) return;
      setState(serverOrLocalState);

      // Se ainda não viu o onboarding inicial, abre o modal de boas-vindas
      if (!serverOrLocalState.hasCompletedInitial) {
        const timer = setTimeout(() => {
          if (isMounted) setIsInitialModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id, sessionChecked]);

  // Ações do Onboarding Inicial
  const openInitialModal = useCallback(() => {
    setIsInitialModalOpen(true);
  }, []);

  const closeInitialModal = useCallback(() => {
    setIsInitialModalOpen(false);
  }, []);

  const completeInitial = useCallback(() => {
    setIsInitialModalOpen(false);
    setState((prev) => {
      const nextState: OnboardingState = {
        ...prev,
        hasCompletedInitial: true,
      };
      saveLocalOnboardingState(nextState, user?.id);
      return nextState;
    });

    syncCompleteInitial(user?.id).catch(() => {});
  }, [user?.id]);

  // Ações do Tour por Tela
  const startTour = useCallback(
    (tourId: string, force = false) => {
      const tour = getTourById(tourId);
      if (!tour || tour.steps.length === 0) return;

      // Se não for forçado e o usuário já tiver visto este tour, ignora
      if (!force && state.completedTours[tourId]) return;

      setActiveTour(tour);
      setCurrentStepIndex(0);
    },
    [state.completedTours]
  );

  const completeTour = useCallback(() => {
    if (!activeTour) return;
    const tourId = activeTour.id;

    setActiveTour(null);
    setCurrentStepIndex(0);

    setState((prev) => {
      const nextState: OnboardingState = {
        ...prev,
        completedTours: {
          ...prev.completedTours,
          [tourId]: true,
        },
      };
      saveLocalOnboardingState(nextState, user?.id);
      return nextState;
    });

    syncCompleteTour(tourId, user?.id).catch(() => {});
  }, [activeTour, user?.id]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex >= activeTour.steps.length - 1) {
      completeTour();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [activeTour, currentStepIndex, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const resetTour = useCallback(
    (tourId: string) => {
      setState((prev) => {
        const nextCompleted = { ...prev.completedTours };
        delete nextCompleted[tourId];
        const nextState: OnboardingState = {
          ...prev,
          completedTours: nextCompleted,
        };
        saveLocalOnboardingState(nextState, user?.id);
        return nextState;
      });
      // Inicia imediatamente
      startTour(tourId, true);
      syncResetTour(tourId, user?.id).catch(() => {});
    },
    [user?.id, startTour]
  );

  const resetAll = useCallback(() => {
    const freshState: OnboardingState = {
      hasCompletedInitial: false,
      completedTours: {},
    };
    setState(freshState);
    saveLocalOnboardingState(freshState, user?.id);
    setActiveTour(null);
    setCurrentStepIndex(0);
    setIsInitialModalOpen(true);
  }, [user?.id]);

  // Disparo automático do tour da tela ao navegar (apenas após o onboarding inicial ter sido concluído)
  useEffect(() => {
    if (!state.hasCompletedInitial || isInitialModalOpen || activeTour) return;

    // Detecta a rota atual
    const pathname = location.pathname.toLowerCase();
    let detectedTourId: string | null = null;

    if (pathname.includes('/dashboard')) detectedTourId = 'dashboard';
    else if (pathname.includes('/tasks')) detectedTourId = 'tasks';
    else if (pathname.includes('/financial')) detectedTourId = 'financial';
    else if (pathname.includes('/shopping')) detectedTourId = 'shopping';

    if (detectedTourId && !state.completedTours[detectedTourId]) {
      const timer = setTimeout(() => {
        startTour(detectedTourId!);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [
    location.pathname,
    state.hasCompletedInitial,
    state.completedTours,
    isInitialModalOpen,
    activeTour,
    startTour,
  ]);

  const currentStep = useMemo(() => {
    if (!activeTour || currentStepIndex < 0 || currentStepIndex >= activeTour.steps.length) {
      return null;
    }
    return activeTour.steps[currentStepIndex];
  }, [activeTour, currentStepIndex]);

  const contextValue: OnboardingContextValue = useMemo(
    () => ({
      hasCompletedInitial: state.hasCompletedInitial,
      completedTours: state.completedTours,
      isInitialModalOpen,
      activeTour,
      currentStepIndex,
      currentStep,
      openInitialModal,
      closeInitialModal,
      completeInitial,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      resetTour,
      resetAll,
    }),
    [
      state.hasCompletedInitial,
      state.completedTours,
      isInitialModalOpen,
      activeTour,
      currentStepIndex,
      currentStep,
      openInitialModal,
      closeInitialModal,
      completeInitial,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      resetTour,
      resetAll,
    ]
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding deve ser usado dentro de um OnboardingProvider');
  }
  return context;
}
