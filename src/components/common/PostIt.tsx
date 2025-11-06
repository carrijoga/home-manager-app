import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { forwardRef, useState } from "react";

interface PostItProps {
  id: number;
  text: string;
  author: string;
  date: string;
  createdBy?: string;
  currentUser?: string;
  onRemove?: (id: number) => void;
  index?: number;
}

/**
 * Componente PostIt - Estilo post-it para avisos
 *
 * Features:
 * - Visual de post-it amarelo (#FEFCE8)
 * - Rotação aleatória leve (-2° a +2°)
 * - Sombra suave
 * - Botão de remover visível ao hover (apenas para avisos do próprio usuário)
 * - Confirmação antes de remover
 * - Animações de entrada/saída
 */
const PostIt = forwardRef<HTMLDivElement, PostItProps>(
  (
    {
      id,
      text,
      author,
      date,
      createdBy,
      currentUser = "Você",
      onRemove,
      index = 0,
    },
    ref
  ) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Gera rotação aleatória consistente baseada no ID
    const rotation = (id % 5) - 2; // Rotação entre -2 e +2 graus

    // Verifica se o usuário atual pode remover este aviso
    const canRemove = createdBy === currentUser || author === currentUser;

    const handleRemove = () => {
      setShowConfirm(true);
    };

    const confirmRemove = () => {
      if (onRemove) {
        onRemove(id);
      }
      setShowConfirm(false);
    };

    return (
      <>
        <motion.div
          ref={ref}
          layout
          initial={{
            opacity: 0,
            scale: 0.8,
            y: -20,
            rotate: rotation,
          }}
          animate={{
            opacity: 1,
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? -8 : 0,
            rotate: isHovered ? 0 : rotation,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            rotate: rotation + 15,
            transition: { duration: 0.3 },
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: index * 0.05,
          }}
          whileHover={{
            scale: 1.05,
            y: -8,
            rotate: 0,
            transition: { duration: 0.2 },
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          style={{ rotate: rotation }}
          className="relative group"
        >
          {/* Post-it */}
          <motion.div
            className="bg-yellow-50 dark:bg-yellow-100 border border-yellow-200 dark:border-yellow-300 rounded-md p-4 min-h-[140px] flex flex-col justify-between"
            animate={{
              boxShadow: isHovered
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Botão remover (apenas para o autor) */}
            {canRemove && onRemove && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.8,
                }}
                transition={{ duration: 0.2 }}
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors duration-200"
                aria-label="Remover aviso"
              >
                <X size={16} />
              </motion.button>
            )}

            {/* Conteúdo do aviso */}
            <div className="flex-1">
              <p className="text-gray-800 dark:text-gray-900 text-sm leading-relaxed break-words">
                {text}
              </p>
            </div>

            {/* Rodapé com autor e data */}
            <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-400 flex justify-between items-center text-xs text-gray-600 dark:text-gray-700">
              <span className="font-medium flex items-center gap-1">
                <span className="inline-block">👤</span>
                {author}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block">📅</span>
                {new Date(date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Diálogo de Confirmação */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover aviso?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este aviso? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemove}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

PostIt.displayName = "PostIt";

export default PostIt;
