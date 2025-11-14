/**
 * Componente AnimatedDialog
 *
 * Dialog melhorado com animações suaves usando Framer Motion.
 * Wrapper sobre o Dialog do shadcn/ui com animações customizadas.
 */

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { modalVariants } from "@/lib/animations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AnimatedDialogProps {
  /** Estado de abertura do dialog */
  open: boolean;
  /** Callback ao mudar estado */
  onOpenChange: (open: boolean) => void;
  /** Título do dialog */
  title?: string;
  /** Descrição do dialog */
  description?: string;
  /** Conteúdo do dialog */
  children: ReactNode;
  /** Rodapé do dialog (botões de ação) */
  footer?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** Largura máxima customizada */
  maxWidth?: string;
}

/**
 * Dialog com animações suaves de entrada e saída
 */
export default function AnimatedDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = "",
  maxWidth = "max-w-lg",
}: AnimatedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, className)}>
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {title && (
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  {description && (
                    <DialogDescription>{description}</DialogDescription>
                  )}
                </DialogHeader>
              )}

              <div className="py-4">{children}</div>

              {footer && <DialogFooter>{footer}</DialogFooter>}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Componentes exportados para uso direto
 */
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
};
