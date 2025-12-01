/**
 * Componente AnimatedCard
 *
 * Card com animações de entrada, hover e tap usando Framer Motion.
 * Pode ser usado em listas com efeito stagger.
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cardVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** Índice para delay no stagger (opcional) */
  index?: number;
  /** Habilitar animação de hover */
  enableHover?: boolean;
  /** Habilitar animação de tap */
  enableTap?: boolean;
  /** Callback ao clicar */
  onClick?: () => void;
  /** Delay customizado para entrada */
  delay?: number;
}

/**
 * Card animado com suporte a hover, tap e stagger
 */
export default function AnimatedCard({
  children,
  className = "",
  index = 0,
  enableHover = true,
  enableTap = true,
  onClick,
  delay,
}: AnimatedCardProps) {
  // Calcula delay para stagger baseado no índice
  const staggerDelay = delay !== undefined ? delay : index * 0.05;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={enableHover ? "hover" : undefined}
      whileTap={enableTap ? "tap" : undefined}
      transition={{
        delay: staggerDelay,
      }}
      onClick={onClick}
      className={cn(
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
