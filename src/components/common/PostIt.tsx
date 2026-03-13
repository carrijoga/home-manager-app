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
  color?: string;
  onRemove?: (id: string) => void;
  onPin?: (id: string) => void;
  onUnpin?: (id: string) => void;
  onEdit?: (id: string, message: string) => void;
  index?: number;
}

// ── Paleta Neon ──────────────────────────────────────────────────────────────
// line: cor escura para as linhas horizontais (visível sobre o fundo neon)
const POST_IT_PALETTE: Record<string, {
  bg: string; border: string; text: string; line: string; shadow: string;
}> = {
  yellow: { bg: '#FFF700', border: '#bfb600', text: '#3a2e00', line: '#a08800', shadow: 'rgba(160,140,0,0.35)' },
  pink:   { bg: '#FF66CC', border: '#cc2299', text: '#4a0028', line: '#990044', shadow: 'rgba(160,0,80,0.28)' },
  green:  { bg: '#CCFF00', border: '#77bb00', text: '#1e3800', line: '#558800', shadow: 'rgba(60,130,0,0.28)' },
  orange: { bg: '#FF9933', border: '#cc5500', text: '#3a1200', line: '#993300', shadow: 'rgba(140,60,0,0.28)' },
  blue:   { bg: '#66CCFF', border: '#0088cc', text: '#001e3a', line: '#005599', shadow: 'rgba(0,80,160,0.28)' },
};

const COLOR_KEYS = ['pink', 'green', 'orange', 'blue', 'yellow'];

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
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h` : `${m}min`;
}

/**
 * PostIt — Nota em post-it com paleta neon.
 * - Amarelo quando fixado, neon determinístico por ID quando livre.
 * - Todos podem fixar/desafixar; apenas o criador pode editar/excluir.
 * - Botões sempre visíveis (não dependem de hover state JS).
 * - Edição inline com textarea.
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
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(message);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const color = resolveColor(noticeId, isPinned, colorKey);
    const rotation = ((noticeId.charCodeAt(0) + noticeId.charCodeAt(1)) % 9) - 4;
    const expiryLabel = formatExpiry(expiresAt);

    const canEdit = !createdBy || !currentUserId || createdBy === currentUserId;

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
        {/* group permite CSS hover nativo para mostrar os botões */}
        <motion.div
          ref={ref}
          layout
          initial={{ opacity: 0, scale: 0.75, y: -30, rotate: rotation }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: rotation }}
          whileHover={{ scale: 1.06, y: -10, rotate: 0, zIndex: 10 }}
          exit={{ opacity: 0, scale: 0.7, rotate: rotation + 20, transition: { duration: 0.25 } }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: index * 0.05 }}
          className="relative cursor-default group"
          style={{ transformOrigin: 'top center', position: 'relative' }}
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
            className="relative rounded-sm overflow-hidden min-h-[130px] flex flex-col"
            style={{
              background: color.bg,
              border: `1.5px solid ${color.border}`,
              paddingTop: '16px',
              boxShadow: `3px 7px 14px ${color.shadow}, 1px 2px 4px rgba(0,0,0,0.1)`,
            }}
            whileHover={{ boxShadow: `6px 14px 28px ${color.shadow}, 2px 4px 8px rgba(0,0,0,0.15)` }}
          >
            {/* Faixa superior colante */}
            <div
              className="absolute top-0 left-0 right-0 h-4"
              style={{ background: `linear-gradient(to bottom, ${color.border}cc, ${color.bg}00)` }}
            />

            {/* Linhas horizontais — cor escura para contraste */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 22px, ${color.line}55 22px, ${color.line}55 23px)`,
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
              <span className="font-semibold truncate max-w-[45%]">{authorName ?? '—'}</span>
              <div className="flex items-center gap-1.5 pr-5">
                {isPinned && <span className="font-bold text-red-700 text-xs">Fixado</span>}
                {!isPinned && expiryLabel && (
                  <span className="text-xs" style={{ color: expiryLabel === 'Expirado' ? '#b91c1c' : color.text }}>
                    {expiryLabel}
                  </span>
                )}
                <span>{new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              </div>
            </div>

            {/* Dobra de canto */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
              style={{
                background: `linear-gradient(225deg, rgba(0,0,0,0.22) 45%, ${color.bg} 50%)`,
              }}
            />
          </motion.div>

          {/* ── Botões de ação ─────────────────────────────────────────────────
              Sempre presentes no DOM mas visíveis via CSS group-hover (nativo,
              sem dependência de estado JS) — funciona em todos os navegadores. */}
          <div className="absolute -top-1 right-0 flex gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {/* Salvar edição */}
            {editing && (
              <button
                onClick={handleSaveEdit}
                title="Salvar (Ctrl+Enter)"
                className="rounded-full p-1.5 shadow bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                <Save size={11} />
              </button>
            )}

            {/* Cancelar edição */}
            {editing && (
              <button
                onClick={() => { setEditing(false); setEditValue(message); }}
                title="Cancelar"
                className="rounded-full p-1.5 shadow bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                <X size={11} />
              </button>
            )}

            {/* Editar (só o autor) */}
            {!editing && canEdit && onEdit && (
              <button
                onClick={() => { setEditing(true); setEditValue(message); }}
                title="Editar"
                className="rounded-full p-1.5 shadow text-white transition-colors"
                style={{ background: color.border }}
              >
                <Edit2 size={11} />
              </button>
            )}

            {/* Pin / Unpin (todos) */}
            {!editing && isPinned && onUnpin && (
              <button
                onClick={() => onUnpin(noticeId)}
                title="Desafixar"
                className="rounded-full p-1.5 shadow text-white transition-colors"
                style={{ background: color.border }}
              >
                <PinOff size={11} />
              </button>
            )}
            {!editing && !isPinned && onPin && (
              <button
                onClick={() => onPin(noticeId)}
                title="Fixar"
                className="rounded-full p-1.5 shadow text-white transition-colors"
                style={{ background: color.border }}
              >
                <Pin size={11} />
              </button>
            )}

            {/* Excluir (só o autor) */}
            {!editing && canEdit && onRemove && (
              <button
                onClick={() => setShowConfirm(true)}
                title="Remover"
                className="rounded-full p-1.5 shadow bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <X size={11} />
              </button>
            )}
          </div>
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
