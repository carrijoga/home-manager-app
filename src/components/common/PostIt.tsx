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
import { Pin, PinOff, X } from "lucide-react";
import { forwardRef, useState } from "react";

interface PostItProps {
  noticeId: string;
  message: string;
  date: string;
  isPinned: boolean;
  expiresAt?: string | null;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  authorName?: string;
  currentUserId?: string;
  onRemove?: (id: string) => void;
  onPin?: (id: string) => void;
  onUnpin?: (id: string) => void;
  index?: number;
}

// Paleta de cores — inspirada nas imagens de referência (post-its coloridos)
const POST_IT_COLORS = [
  { bg: '#fef08a', border: '#fde047', text: '#713f12', line: '#fde68a' }, // Amarelo
  { bg: '#fda4af', border: '#fb7185', text: '#881337', line: '#fecdd3' }, // Rosa
  { bg: '#86efac', border: '#4ade80', text: '#14532d', line: '#bbf7d0' }, // Verde
  { bg: '#93c5fd', border: '#60a5fa', text: '#1e3a5f', line: '#bfdbfe' }, // Azul
  { bg: '#d8b4fe', border: '#c084fc', text: '#581c87', line: '#ede9fe' }, // Roxo
  { bg: '#fdba74', border: '#fb923c', text: '#7c2d12', line: '#fed7aa' }, // Laranja
];

function getColor(id: string, index: number) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return POST_IT_COLORS[(hash + index) % POST_IT_COLORS.length];
}

function formatExpiry(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h restante${hours > 1 ? 's' : ''}`;
  return `${minutes}min restante${minutes !== 1 ? 's' : ''}`;
}

/**
 * PostIt — Nota autoadesiva para o Quadro de Avisos (quadro de cortiça).
 *
 * Features:
 * - 6 paletas de cores rotacionadas por ID
 * - Pino (pushpin) visual no topo — vermelho quando fixado, cinza quando livre
 * - Indicador de expiração restante
 * - Efeito de dobra de canto inferior direito
 * - Linhas horizontais sutis (estilo caderno)
 * - Botões pin/unpin + remover aparecem no hover
 */
const PostIt = forwardRef<HTMLDivElement, PostItProps>(
  ({
    noticeId,
    message,
    date,
    isPinned,
    expiresAt,
    authorName,
    currentUserId,
    createdBy,
    onRemove,
    onPin,
    onUnpin,
    index = 0,
  }, ref) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const color = getColor(noticeId, index);
    const rotation = ((noticeId.charCodeAt(0) + noticeId.charCodeAt(1)) % 9) - 4;
    const expiryLabel = formatExpiry(expiresAt);
    const canManage = !createdBy || !currentUserId || createdBy === currentUserId;

    return (
      <>
        <motion.div
          ref={ref}
          layout
          initial={{ opacity: 0, scale: 0.75, y: -30, rotate: rotation }}
          animate={{
            opacity: 1,
            scale: isHovered ? 1.06 : 1,
            y: isHovered ? -10 : 0,
            rotate: isHovered ? 0 : rotation,
          }}
          exit={{
            opacity: 0,
            scale: 0.7,
            rotate: rotation + 20,
            transition: { duration: 0.25 },
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 22,
            delay: index * 0.06,
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative cursor-default"
          style={{ transformOrigin: 'top center', zIndex: isHovered ? 10 : 1, position: 'relative' }}
        >
          {/* Pushpin */}
          <div className="absolute left-1/2 -top-4 z-20" style={{ transform: 'translateX(-50%)' }}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2"
              style={{
                background: isPinned
                  ? 'radial-gradient(circle at 35% 35%, #f87171, #dc2626)'
                  : 'radial-gradient(circle at 35% 35%, #d1d5db, #9ca3af)',
                borderColor: isPinned ? '#b91c1c' : '#6b7280',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
            </div>
            <div className="w-0.5 h-2.5 mx-auto" style={{ background: isPinned ? '#991b1b' : '#6b7280' }} />
          </div>

          {/* Corpo do post-it */}
          <motion.div
            animate={{
              boxShadow: isHovered
                ? `6px 14px 28px rgba(0,0,0,0.28), 2px 4px 8px rgba(0,0,0,0.15)`
                : `3px 7px 14px rgba(0,0,0,0.2), 1px 2px 5px rgba(0,0,0,0.1)`,
            }}
            transition={{ duration: 0.2 }}
            className="relative rounded-sm overflow-hidden min-h-[130px] flex flex-col"
            style={{ background: color.bg, border: `1px solid ${color.border}`, paddingTop: '16px' }}
          >
            {/* Faixa superior — lado colante */}
            <div
              className="absolute top-0 left-0 right-0 h-4"
              style={{ background: `linear-gradient(to bottom, ${color.border}dd, ${color.bg}00)` }}
            />

            {/* Linhas horizontais */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 22px, ${color.line}70 22px, ${color.line}70 23px)`,
                backgroundPosition: '0 24px',
              }}
            />

            {/* Mensagem */}
            <div className="relative flex-1 px-3 pt-1 pb-2">
              <p className="text-sm leading-relaxed break-words" style={{ color: color.text, fontWeight: 500 }}>
                {message}
              </p>
            </div>

            {/* Rodapé */}
            <div
              className="relative px-3 py-1.5 flex justify-between items-center text-xs"
              style={{ borderTop: `1px solid ${color.border}80`, color: color.text, opacity: 0.85 }}
            >
              <span className="font-semibold truncate max-w-[55%]">{authorName ?? '—'}</span>
              <div className="flex items-center gap-1.5">
                {isPinned && <span className="font-bold text-red-600 text-xs">Fixado</span>}
                {!isPinned && expiryLabel && (
                  <span className="text-xs" style={{ color: expiryLabel === 'Expirado' ? '#dc2626' : color.text }}>
                    {expiryLabel}
                  </span>
                )}
                <span>
                  {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Dobra de canto */}
            <div
              className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none"
              style={{
                background: `linear-gradient(225deg, rgba(0,0,0,0.18) 45%, ${color.bg} 50%)`,
                borderTop: `1px solid ${color.border}50`,
                borderLeft: `1px solid ${color.border}50`,
              }}
            />
          </motion.div>

          {/* Botões — hover */}
          {canManage && (onRemove || onPin || onUnpin) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-1 right-0 flex gap-1 z-20"
            >
              {isPinned && onUnpin ? (
                <button
                  onClick={() => onUnpin(noticeId)}
                  title="Desafixar"
                  className="rounded-full p-1 shadow-sm transition-colors"
                  style={{ background: color.border, color: color.text }}
                >
                  <PinOff size={11} />
                </button>
              ) : !isPinned && onPin ? (
                <button
                  onClick={() => onPin(noticeId)}
                  title="Fixar"
                  className="rounded-full p-1 shadow-sm transition-colors"
                  style={{ background: color.border, color: color.text }}
                >
                  <Pin size={11} />
                </button>
              ) : null}
              {onRemove && (
                <button
                  onClick={() => setShowConfirm(true)}
                  title="Remover"
                  className="rounded-full p-1 shadow-sm bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover aviso?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { onRemove?.(noticeId); setShowConfirm(false); }}
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
