/**
 * Exportações centralizadas de componentes animados
 *
 * Este arquivo facilita a importação de componentes animados em toda a aplicação.
 *
 * @example
 * ```tsx
 * import {
 *   PageTransition,
 *   AnimatedCard,
 *   AnimatedButton,
 *   useToast,
 *   toast
 * } from '@/components/animated';
 * ```
 */

// ============================================================================
// TRANSIÇÕES E LAYOUTS
// ============================================================================

export { default as PageTransition } from "../common/PageTransition";

// ============================================================================
// CARDS E LISTAS
// ============================================================================

export { default as AnimatedCard } from "../common/AnimatedCard";
export {
  AnimatedList,
  AnimatedListItem,
  AnimatedGrid,
} from "../common/AnimatedList";

// ============================================================================
// DIALOGS E MODALS
// ============================================================================

export { default as AnimatedDialog } from "../common/AnimatedDialog";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../common/AnimatedDialog";

// ============================================================================
// POST-ITS
// ============================================================================

export { default as AnimatedPostIt } from "../common/AnimatedPostIt";
export {
  PostItHeader,
  PostItBody,
  PostItFooter,
} from "../common/AnimatedPostIt";

// ============================================================================
// TAREFAS
// ============================================================================

export { default as AnimatedTask } from "../common/AnimatedTask";
export {
  AnimatedCheckbox,
  AnimatedStrikethroughText,
  TaskContent,
  TaskActions,
} from "../common/AnimatedTask";

// ============================================================================
// BOTÕES
// ============================================================================

export { default as AnimatedButton } from "../common/AnimatedButton";
export {
  AnimatedIconButton,
  FloatingActionButton,
  PulsingButton,
  ShakeButton,
} from "../common/AnimatedButton";

// ============================================================================
// TOAST/NOTIFICAÇÕES
// ============================================================================

export {
  ToastProvider,
  useToast,
  toast,
} from "../common/AnimatedToast";

// ============================================================================
// HOOKS
// ============================================================================

export {
  usePrefersReducedMotion,
  useReducedMotionTransition,
  useReducedMotionVariants,
} from "../../hooks/usePrefersReducedMotion";

// ============================================================================
// CONFIGURAÇÕES E VARIANTES
// ============================================================================

export * from "../../lib/animations";
