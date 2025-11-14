/**
 * Componente AnimatedPostIt
 *
 * Post-it animado para o quadro de avisos com efeitos de entrada,
 * rotação aleatória, hover e arrasto.
 */

import { motion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { postItVariants, getRandomRotation } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedPostItProps {
  children: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** ID único do post-it */
  id: string;
  /** Índice para delay no stagger */
  index?: number;
  /** Habilitar arrasto */
  draggable?: boolean;
  /** Callback ao arrastar */
  onDragEnd?: (id: string, x: number, y: number) => void;
  /** Cor do post-it */
  color?: "yellow" | "pink" | "blue" | "green" | "purple";
}

/**
 * Post-it com animações características (rotação, hover, drag)
 */
export default function AnimatedPostIt({
  children,
  className = "",
  id,
  index = 0,
  draggable = false,
  onDragEnd,
  color = "yellow",
}: AnimatedPostItProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Define rotação aleatória ao montar
    setRotation(getRandomRotation());
  }, []);

  // Cores disponíveis para post-its
  const colorClasses = {
    yellow: "bg-aconchego-100 dark:bg-aconchego-200/20 border-aconchego-300",
    pink: "bg-pink-100 dark:bg-pink-200/20 border-pink-300",
    blue: "bg-serenidade-100 dark:bg-serenidade-200/20 border-serenidade-300",
    green: "bg-natureza-100 dark:bg-natureza-200/20 border-natureza-300",
    purple: "bg-purple-100 dark:bg-purple-200/20 border-purple-300",
  };

  // Delay para stagger
  const staggerDelay = index * 0.05;

  return (
    <motion.div
      custom={rotation}
      variants={postItVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileDrag={draggable ? "drag" : undefined}
      drag={draggable}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(_event, info) => {
        if (onDragEnd) {
          onDragEnd(id, info.offset.x, info.offset.y);
        }
      }}
      transition={{
        delay: staggerDelay,
      }}
      className={cn(
        "relative p-4 shadow-md border-2",
        "transition-shadow duration-200",
        "hover:shadow-xl",
        colorClasses[color],
        draggable && "cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        transformOrigin: "center center",
      }}
    >
      {children}
    </motion.div>
  );
}

interface PostItHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * Cabeçalho do post-it (título)
 */
export function PostItHeader({ children, className = "" }: PostItHeaderProps) {
  return (
    <div className={cn("font-medium mb-2 text-gray-900 dark:text-gray-100", className)}>
      {children}
    </div>
  );
}

interface PostItBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Corpo do post-it (conteúdo)
 */
export function PostItBody({ children, className = "" }: PostItBodyProps) {
  return (
    <div className={cn("text-sm text-gray-700 dark:text-gray-300", className)}>
      {children}
    </div>
  );
}

interface PostItFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Rodapé do post-it (ações, data, etc.)
 */
export function PostItFooter({ children, className = "" }: PostItFooterProps) {
  return (
    <div className={cn("mt-3 pt-2 border-t border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400", className)}>
      {children}
    </div>
  );
}
