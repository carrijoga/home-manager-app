/**
 * Configurações e variantes de animação usando Framer Motion
 *
 * Este arquivo centraliza todas as configurações de animação do aplicativo,
 * incluindo transições, variantes e utilitários.
 */

import { Variants, Transition } from "framer-motion";

// ============================================================================
// TRANSIÇÕES GLOBAIS
// ============================================================================

export const transitions = {
  fast: { duration: 0.15, ease: "easeOut" },
  normal: { duration: 0.3, ease: "easeInOut" },
  slow: { duration: 0.5, ease: "easeInOut" },
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30
  },
  springGentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25
  },
  springBouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 20
  },
} as const;

// ============================================================================
// VARIANTES DE PÁGINA
// ============================================================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

export const pageSlideVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast,
  },
};

// ============================================================================
// VARIANTES DE CARDS E LISTAS
// ============================================================================

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.springGentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
  hover: {
    y: -4,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

// Container para stagger animation
export const listContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast,
  },
};

// ============================================================================
// VARIANTES DE DIALOGS/MODALS
// ============================================================================

export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.springGentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

// ============================================================================
// VARIANTES DE TOAST/NOTIFICATIONS
// ============================================================================

export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

export const toastFromRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: transitions.fast,
  },
};

// ============================================================================
// VARIANTES DE ACCORDION
// ============================================================================

export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: transitions.normal,
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: transitions.normal,
  },
};

export const chevronVariants: Variants = {
  collapsed: {
    rotate: 0,
    transition: transitions.fast,
  },
  expanded: {
    rotate: 180,
    transition: transitions.fast,
  },
};

// ============================================================================
// VARIANTES DE BOTÕES
// ============================================================================

export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

export const iconButtonVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.1,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.9,
    transition: transitions.fast,
  },
};

// ============================================================================
// VARIANTES DE CHECKBOX/TOGGLE
// ============================================================================

export const checkboxVariants: Variants = {
  unchecked: {
    scale: 1,
    transition: transitions.spring,
  },
  checked: {
    scale: [1, 1.2, 1],
    transition: transitions.spring,
  },
};

export const checkmarkVariants: Variants = {
  unchecked: {
    pathLength: 0,
    opacity: 0,
  },
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.2, ease: "easeOut" },
      opacity: { duration: 0.1 },
    },
  },
};

export const toggleVariants: Variants = {
  off: {
    x: 2,
    transition: transitions.spring,
  },
  on: {
    x: 22,
    transition: transitions.spring,
  },
};

// ============================================================================
// VARIANTES DE POST-ITS (QUADRO DE AVISOS)
// ============================================================================

/**
 * Gera uma rotação aleatória leve para post-its
 */
export const getRandomRotation = (): number => {
  return Math.random() * 6 - 3; // Entre -3 e 3 graus
};

export const postItVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotate: 0,
  },
  animate: (custom: number) => ({
    opacity: 1,
    scale: 1,
    rotate: custom || getRandomRotation(),
    transition: {
      ...transitions.springBouncy,
      delay: Math.random() * 0.2,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.5,
    rotate: -15,
    transition: transitions.normal,
  },
  hover: {
    scale: 1.05,
    rotate: 0,
    zIndex: 10,
    transition: transitions.fast,
  },
  drag: {
    scale: 1.1,
    rotate: 0,
    zIndex: 20,
    cursor: "grabbing",
  },
};

// ============================================================================
// VARIANTES DE TAREFAS
// ============================================================================

export const taskVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
  completed: {
    opacity: 0.6,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    x: 20,
    height: 0,
    marginBottom: 0,
    transition: transitions.normal,
  },
};

export const taskCheckboxVariants: Variants = {
  unchecked: {
    backgroundColor: "transparent",
    borderColor: "currentColor",
    transition: transitions.fast,
  },
  checked: {
    backgroundColor: "currentColor",
    scale: [1, 1.2, 1],
    transition: transitions.spring,
  },
};

export const strikethroughVariants: Variants = {
  unchecked: {
    width: "0%",
    transition: transitions.normal,
  },
  checked: {
    width: "100%",
    transition: transitions.normal,
  },
};

// ============================================================================
// VARIANTES DE CARROSSEL
// ============================================================================

export const carouselVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    transition: transitions.spring,
  }),
};

// ============================================================================
// VARIANTES DE FADE
// ============================================================================

export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const fadeUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

// ============================================================================
// VARIANTES DE SCALE
// ============================================================================

export const scaleVariants: Variants = {
  initial: {
    scale: 0.9,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: transitions.springGentle,
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: transitions.fast,
  },
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Hook para detectar preferência de movimento reduzido
 */
export const usePrefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
};

/**
 * Retorna transição desabilitada se o usuário preferir movimento reduzido
 */
export const getTransition = (
  transition: Transition,
  prefersReducedMotion: boolean
): Transition => {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return transition;
};

/**
 * Propriedades comuns para AnimatePresence
 */
export const animatePresenceProps = {
  mode: "wait" as const,
  initial: false,
};

/**
 * Delay para stagger em grids
 */
export const getStaggerDelay = (index: number, baseDelay = 0.05): number => {
  return index * baseDelay;
};
