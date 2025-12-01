/**
 * Componente AnimatedButton
 *
 * Botão com micro-interações suaves (hover, tap) usando Framer Motion.
 * Wrapper para o Button do shadcn/ui com animações adicionais.
 */

import { motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { buttonVariants, iconButtonVariants, transitions } from "@/lib/animations";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
  /** Tipo de animação */
  animationType?: "default" | "icon" | "none";
  /** Habilitar efeito ripple (experimental) */
  enableRipple?: boolean;
}

/**
 * Botão com micro-interações animadas
 */
const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      children,
      className = "",
      animationType = "default",
      enableRipple = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // Se desabilitado, não animar
    if (disabled) {
      return (
        <Button ref={ref} disabled className={className} {...props}>
          {children}
        </Button>
      );
    }

    // Se animação desabilitada
    if (animationType === "none") {
      return (
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      );
    }

    // Seleciona variantes baseado no tipo
    const variants =
      animationType === "icon" ? iconButtonVariants : buttonVariants;

    return (
      <motion.div
        variants={variants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="inline-block"
      >
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;

interface AnimatedIconButtonProps extends AnimatedButtonProps {
  /** Ícone a ser exibido */
  icon: ReactNode;
  /** Label para acessibilidade */
  "aria-label": string;
}

/**
 * Botão de ícone com animação de rotação ao hover
 */
export const AnimatedIconButton = forwardRef<
  HTMLButtonElement,
  AnimatedIconButtonProps
>(({ icon, className = "", ...props }, ref) => {
  return (
    <AnimatedButton
      ref={ref}
      animationType="icon"
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      {...props}
    >
      {icon}
    </AnimatedButton>
  );
});

AnimatedIconButton.displayName = "AnimatedIconButton";

interface FloatingActionButtonProps extends AnimatedButtonProps {
  /** Posição do FAB */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

/**
 * Floating Action Button com animação de entrada
 */
export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(({ children, position = "bottom-right", className = "", ...props }, ref) => {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={transitions.springBouncy}
      className={cn("fixed z-50", positionClasses[position])}
    >
      <AnimatedButton
        ref={ref}
        size="lg"
        className={cn("rounded-full shadow-lg h-14 w-14 p-0", className)}
        {...props}
      >
        {children}
      </AnimatedButton>
    </motion.div>
  );
});

FloatingActionButton.displayName = "FloatingActionButton";

interface PulsingButtonProps extends ButtonProps {
  /** Intensidade da pulsação */
  intensity?: "low" | "medium" | "high";
}

/**
 * Botão com efeito de pulsação para chamar atenção
 */
export const PulsingButton = forwardRef<HTMLButtonElement, PulsingButtonProps>(
  ({ children, intensity = "medium", className = "", ...props }, ref) => {
    const pulseIntensity = {
      low: [1, 1.02, 1],
      medium: [1, 1.05, 1],
      high: [1, 1.08, 1],
    };

    return (
      <motion.div
        animate={{
          scale: pulseIntensity[intensity],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

PulsingButton.displayName = "PulsingButton";

interface ShakeButtonProps extends ButtonProps {
  /** Estado de shake */
  shake?: boolean;
  /** Callback ao terminar shake */
  onShakeComplete?: () => void;
}

/**
 * Botão que pode "chacoalhar" para indicar erro
 */
export const ShakeButton = forwardRef<HTMLButtonElement, ShakeButtonProps>(
  (
    { children, shake = false, onShakeComplete, className = "", ...props },
    ref
  ) => {
    return (
      <motion.div
        animate={
          shake
            ? {
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.4 },
              }
            : {}
        }
        onAnimationComplete={onShakeComplete}
      >
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

ShakeButton.displayName = "ShakeButton";
