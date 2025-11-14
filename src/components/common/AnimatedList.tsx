/**
 * Componente AnimatedList
 *
 * Container para listas animadas com efeito stagger.
 * Os itens filhos aparecem em sequência com delay progressivo.
 */

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { listContainerVariants, listItemVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** Delay entre cada item (em segundos) */
  staggerDelay?: number;
}

/**
 * Container de lista com stagger animation
 */
export function AnimatedList({
  children,
  className = "",
  staggerDelay = 0.05,
}: AnimatedListProps) {
  return (
    <motion.div
      variants={listContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      transition={{
        staggerChildren: staggerDelay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** Chave única para AnimatePresence */
  itemKey?: string | number;
  /** Callback ao clicar */
  onClick?: () => void;
}

/**
 * Item de lista individual com animação
 */
export function AnimatedListItem({
  children,
  className = "",
  itemKey,
  onClick,
}: AnimatedListItemProps) {
  return (
    <motion.div
      key={itemKey}
      variants={listItemVariants}
      layout
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

interface AnimatedGridProps {
  children: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** Delay entre cada item (em segundos) */
  staggerDelay?: number;
}

/**
 * Grid animado com stagger (similar ao AnimatedList mas para grids)
 */
export function AnimatedGrid({
  children,
  className = "",
  staggerDelay = 0.05,
}: AnimatedGridProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={listContainerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        transition={{
          staggerChildren: staggerDelay,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
