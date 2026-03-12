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
import { Edit2, Pin, PinOff, Save, X } from "lucide-react";
import { forwardRef, useRef, useState } from "react";

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
  color?: string; // color key: yellow|pink|green|orange|blue
  onRemove?: (id: string) => void;
  onPin?: (id: string) => void;
  onUnpin?: (id: string) => void;
  onEdit?: (id: string, message: string) => void;
  index?: number;
}

// ── Paleta Neon (especificada pelo usuário) ───────────────────────────────────
const POST_IT_PALETTE: Record<string, {
  bg: string; border: string; text: string; line: string; shadow: string;
}> = {
  yellow: { bg: '#FFF700', border: '#c8c000', text: '#3a2e00', line: '#fffab0', shadow: 'rgba(180,160,0,0.35)' },
  pink:   { bg: '#FF66CC', border: '#cc3399', text: '#5c0033', line: '#ffb3e6', shadow: 'rgba(180,0,100,0.25)' },
  green:  { bg: '#CCFF00', border: '#88cc00', text: '#284000', line: '#e8ff99', shadow: 'rgba(80,160,0,0.28)' },
  orange: { bg: '#FF9933', border: '#cc6600', text: '#4a1800', line: '#ffd0a0', shadow: 'rgba(160,80,0,0.28)' },
  blue:   { bg: '#66CCFF', border: '#0099dd', text: '#002244', line: '#c0e8ff', shadow: 'rgba(0,100,200,0.25)' },
};

const COLOR_KEYS = ['pink', 'green', 'orange', 'blue', 'yellow'];

// Cor determinística por noticeId (sem index para não mudar ao adicionar novos)
function resolveColor(noticeId: string, isPinned: boolean, colorKey?: string) {
  if (isPinned) return POST_IT_PALETTE.yellow;
  if (colorKey && POST_IT_PALETTE[colorKey]) return POST_IT_PALETTE[colorKey];
  const hash = noticeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return POST_IT_PALETTE[COLOR_KEYS[hash % COLOR_KEYS.length]];
}

function formatExpiry(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

/**
 * PostIt — Nota em post-it com paleta neon.
 * - Amarelo quando fixado, neon aleatório (determinístico por ID) quando livre.
 * - Pino visual (vermelho = fixado, cinza = livre).
 * - Todos podem fixar/desafixar; apenas o autor pode editar/excluir.
 * - Edição inline ao clicar no lápis.
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
    color: colorKey,
    onRemove,
    onPin,
    onUnpin,
    onEdit,
    index = 0,
  }, ref) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(message);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const color = resolveColor(noticeId, isPinned, colorKey);
    const rotation = ((noticeId.charCodeAt(0) + noticeId.charCodeAt(1)) % 9) - 4;
    const expiryLabel = formatExpiry(expiresAt);

    const canEdit = !createdBy || !currentUserId || createdBy === currentUserId;
    const canPin = !!(onPin || onUnpin);

    const handleSaveEdit = () => {
      if (editValue.trim() && editValue.trim() !== message) {
        onEdit?.(noticeId, editValue.trim());
      }
      setEditing(false);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit();
      if (e.key === 'Escape') { setEditing(false); setEditValue(message); }
    };

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
            delay: index * 0.05,
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
                ? `6px 14px 28px ${color.shadow}, 2px 4px 8px rgba(0,0,0,0.15)`
                : `3px 7px 14px ${color.shadow}, 1px 2px 4px rgba(0,0,0,0.1)`,
            }}
            transition={{ duration: 0.2 }}
            className="relative rounded-sm overflow-hidden min-h-[130px] flex flex-col"
            style={{ background: color.bg, border: `1.5px solid ${color.border}`, paddingTop: '16px' }}
          >
            {/* Faixa superior colante */}
            <div
              className="absolute top-0 left-0 right-0 h-4"
              style={{ background: `linear-gradient(to bottom, ${color.border}cc, ${color.bg}00)` }}
            />

            {/* Linhas horizontais */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 22px, ${color.line}80 22px, ${color.line}80 23px)`,
                backgroundPosition: '0 24px',
              }}
            />

            {/* Mensagem / Editor */}
            <div className="relative flex-1 px-3 pt-1 pb-2">
              {editing ? (
                <textarea
                  ref={textareaRef}
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  maxLength={200}
                  rows={4}
                  className="w-full resize-none text-sm leading-relaxed bg-transparent outline-none border-b-2 border-dashed"
                  style={{ color: color.text, borderColor: color.border }}
                />
              ) : (
                <p className="text-sm leading-relaxed break-words" style={{ color: color.text, fontWeight: 500 }}>
                  {message}
                </p>
              )}
            </div>

            {/* Rodapé */}
            <div
              className="relative px-3 py-1.5 flex justify-between items-center text-xs"
              style={{ borderTop: `1px solid ${color.border}60`, color: color.text, opacity: 0.85 }}
            >
              <span className="font-semibold truncate max-w-[50%]">{authorName ?? '—'}</span>
              {/* pr-5 para não sobrepor a dobra de canto */}
              <div className="flex items-center gap-1.5 pr-5">
                {isPinned && <span className="font-bold text-red-700 text-xs">Fixado</span>}
                {!isPinned && expiryLabel && (
                  <span className="text-xs" style={{ color: expiryLabel === 'Expirado' ? '#b91c1c' : color.text }}>
                    {expiryLabel}
                  </span>
                )}
                <span>
                  {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Dobra de canto — 16×16 para não cobrir texto */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
              style={{
                background: `linear-gradient(225deg, rgba(0,0,0,0.25) 45%, ${color.bg} 50%)`,
                borderTop: `1px solid ${color.border}40`,
                borderLeft: `1px solid ${color.border}40`,
              }}
            />
          </motion.div>

          {/* Botões — hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-1 right-0 flex gap-1 z-20"
          >
            {editing && (
              <button
                onClick={handleSaveEdit}
                title="Salvar (Ctrl+Enter)"
                className="rounded-full p-1 shadow-sm transition-colors bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Save size={11} />
              </button>
            )}

            {!editing && canEdit && onEdit && (
              <button
                onClick={() => { setEditing(true); setEditValue(message); }}
                title="Editar"
                className="rounded-full p-1 shadow-sm transition-colors"
                style={{ background: color.border, color: '#fff' }}
              >
                <Edit2 size={11} />
              </button>
            )}

            {canPin && !editing && (
              isPinned && onUnpin ? (
                <button
                  onClick={() => onUnpin(noticeId)}
                  title="Desafixar"
                  className="rounded-full p-1 shadow-sm transition-colors"
                  style={{ background: color.border, color: '#fff' }}
                >
                  <PinOff size={11} />
                </button>
              ) : !isPinned && onPin ? (
                <button
                  onClick={() => onPin(noticeId)}
                  title="Fixar"
                  className="rounded-full p-1 shadow-sm transition-colors"
                  style={{ background: color.border, color: '#fff' }}
                >
                  <Pin size={11} />
                </button>
              ) : null
            )}

            {!editing && canEdit && onRemove && (
              <button
                onClick={() => setShowConfirm(true)}
                title="Remover"
                className="rounded-full p-1 shadow-sm bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <X size={11} />
              </button>
            )}
          </motion.div>
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
export { POST_IT_PALETTE, COLOR_KEYS };
export type { PostItProps };
