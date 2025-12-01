/**
 * Componente AnimatedTask
 *
 * Item de tarefa com animações de conclusão, incluindo:
 * - Checkbox com animação de check
 * - Strikethrough animado no texto
 * - Transição de opacidade ao completar
 * - Animação de saída ao mover para concluídas
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  taskVariants,
  taskCheckboxVariants,
  strikethroughVariants,
  transitions,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedTaskProps {
  children: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** ID único da tarefa */
  id: string;
  /** Estado de conclusão */
  completed: boolean;
  /** Índice para delay no stagger */
  index?: number;
  /** Callback ao clicar */
  onClick?: () => void;
}

/**
 * Item de tarefa com animações de entrada, conclusão e saída
 */
export default function AnimatedTask({
  children,
  className = "",
  id,
  completed,
  index = 0,
  onClick,
}: AnimatedTaskProps) {
  const staggerDelay = index * 0.03;

  return (
    <motion.div
      key={id}
      variants={taskVariants}
      initial="initial"
      animate={completed ? "completed" : "animate"}
      exit="exit"
      transition={{
        delay: staggerDelay,
      }}
      layout
      className={cn(
        "transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCheckboxProps {
  /** Estado de marcação */
  checked: boolean;
  /** Callback ao mudar estado */
  onChange: (checked: boolean) => void;
  /** Classe CSS adicional */
  className?: string;
  /** Tamanho do checkbox */
  size?: "sm" | "md" | "lg";
}

/**
 * Checkbox animado com efeito de spring ao marcar
 */
export function AnimatedCheckbox({
  checked,
  onChange,
  className = "",
  size = "md",
}: AnimatedCheckboxProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      animate={checked ? "checked" : "unchecked"}
      variants={taskCheckboxVariants}
      className={cn(
        "relative flex items-center justify-center rounded border-2",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ninho-500 focus:ring-offset-2",
        checked
          ? "bg-ninho-500 border-ninho-500 text-white"
          : "bg-transparent border-gray-300 dark:border-gray-600",
        sizeClasses[size],
        className
      )}
    >
      {checked && (
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3"
          initial="unchecked"
          animate="checked"
          variants={{
            unchecked: { pathLength: 0, opacity: 0 },
            checked: {
              pathLength: 1,
              opacity: 1,
              transition: {
                pathLength: { duration: 0.2, ease: "easeOut" },
                opacity: { duration: 0.1 },
              },
            },
          }}
        >
          <motion.path d="M5 12l5 5L20 7" />
        </motion.svg>
      )}
    </motion.button>
  );
}

interface AnimatedStrikethroughTextProps {
  children: ReactNode;
  /** Estado de conclusão */
  completed: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Texto com animação de strikethrough ao completar
 */
export function AnimatedStrikethroughText({
  children,
  completed,
  className = "",
}: AnimatedStrikethroughTextProps) {
  return (
    <div className={cn("relative", className)}>
      <span
        className={cn(
          "transition-opacity duration-300",
          completed && "opacity-60"
        )}
      >
        {children}
      </span>

      {/* Linha de strikethrough animada */}
      <motion.div
        className="absolute inset-0 flex items-center pointer-events-none"
        initial={false}
        animate={completed ? "checked" : "unchecked"}
      >
        <motion.div
          variants={strikethroughVariants}
          transition={transitions.normal}
          className="h-[2px] bg-current"
          style={{ transformOrigin: "left center" }}
        />
      </motion.div>
    </div>
  );
}

interface TaskContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container para conteúdo da tarefa
 */
export function TaskContent({ children, className = "" }: TaskContentProps) {
  return <div className={cn("flex-1", className)}>{children}</div>;
}

interface TaskActionsProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container para ações da tarefa (botões, etc.)
 */
export function TaskActions({ children, className = "" }: TaskActionsProps) {
  return (
    <div className={cn("flex items-center gap-2 ml-auto", className)}>
      {children}
    </div>
  );
}
