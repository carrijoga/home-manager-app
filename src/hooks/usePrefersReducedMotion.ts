/**
 * Hook usePrefersReducedMotion
 *
 * Detecta se o usuário habilitou a configuração de acessibilidade
 * "prefers-reduced-motion" no sistema operacional.
 *
 * Quando true, as animações devem ser reduzidas ou removidas.
 */

import { useEffect, useState } from "react";

/**
 * Hook que retorna true se o usuário prefere movimento reduzido
 *
 * @returns {boolean} true se prefers-reduced-motion está habilitado
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={{
 *         duration: prefersReducedMotion ? 0 : 0.3
 *       }}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Media query para detectar preferência de movimento reduzido
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Define valor inicial
    setPrefersReducedMotion(mediaQuery.matches);

    // Handler para mudanças na preferência
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Adiciona listener (suporta navegadores antigos e modernos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback para navegadores antigos
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Retorna um objeto de transição ajustado para respeitar
 * a preferência de movimento reduzido
 *
 * @param normalTransition - Transição normal quando não há preferência
 * @returns Transição ajustada (duration: 0 se preferir movimento reduzido)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const transition = useReducedMotionTransition({ duration: 0.3 });
 *
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={transition}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useReducedMotionTransition(normalTransition: any) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return { duration: 0 };
  }

  return normalTransition;
}

/**
 * Retorna variantes ajustadas para respeitar movimento reduzido
 *
 * @param normalVariants - Variantes normais
 * @param reducedVariants - Variantes para movimento reduzido (opcional)
 * @returns Variantes ajustadas
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const variants = useReducedMotionVariants(
 *     {
 *       initial: { opacity: 0, y: 20 },
 *       animate: { opacity: 1, y: 0 }
 *     },
 *     {
 *       initial: { opacity: 0 },
 *       animate: { opacity: 1 }
 *     }
 *   );
 *
 *   return (
 *     <motion.div variants={variants} initial="initial" animate="animate">
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useReducedMotionVariants(
  normalVariants: any,
  reducedVariants?: any
) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    // Se variantes reduzidas foram fornecidas, usa elas
    if (reducedVariants) {
      return reducedVariants;
    }

    // Caso contrário, remove transformações mas mantém opacity
    const reduced: any = {};
    for (const key in normalVariants) {
      reduced[key] = {
        opacity: normalVariants[key].opacity ?? 1,
      };
    }
    return reduced;
  }

  return normalVariants;
}

export default usePrefersReducedMotion;
