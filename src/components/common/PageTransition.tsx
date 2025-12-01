/**
 * Componente PageTransition
 *
 * Wrapper para páginas e módulos que adiciona transições suaves
 * ao entrar e sair usando Framer Motion.
 */

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { getTransition, transitions } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  /** Chave única para a página/módulo (dispara re-animação quando muda) */
  pageKey?: string;
  /** Variante de animação customizada (opcional) */
  variant?: "fade" | "slide" | "scale";
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente que envolve páginas/módulos com transições animadas
 */
export default function PageTransition({
  children,
  pageKey,
  variant = "fade",
  className = "",
}: PageTransitionProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detecta preferência de movimento reduzido
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Variantes de animação baseadas no tipo
  const getVariants = () => {
    if (prefersReducedMotion) {
      // Sem animação se o usuário preferir movimento reduzido
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      };
    }

    switch (variant) {
      case "slide":
        return {
          initial: { opacity: 0, x: -20 },
          animate: {
            opacity: 1,
            x: 0,
            transition: getTransition(transitions.normal, prefersReducedMotion),
          },
          exit: {
            opacity: 0,
            x: 20,
            transition: getTransition(transitions.fast, prefersReducedMotion),
          },
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: {
            opacity: 1,
            scale: 1,
            transition: getTransition(transitions.springGentle, prefersReducedMotion),
          },
          exit: {
            opacity: 0,
            scale: 0.95,
            transition: getTransition(transitions.fast, prefersReducedMotion),
          },
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0, y: 20 },
          animate: {
            opacity: 1,
            y: 0,
            transition: getTransition(transitions.normal, prefersReducedMotion),
          },
          exit: {
            opacity: 0,
            y: -20,
            transition: getTransition(transitions.fast, prefersReducedMotion),
          },
        };
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={getVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
