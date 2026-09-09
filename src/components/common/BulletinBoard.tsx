import { motion } from 'framer-motion';
import { History, Pencil, Pin, Plus, Smile, Trash2 } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ApiPriority } from '@/types';

export interface BulletinNoteReaction {
  reactionId?: string;
  noticeId?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  emoji: string;
  createdAt?: string;
  count?: number;
}

export interface BulletinNote {
  id: string;
  priority: ApiPriority;
  content: ReactNode;
  isPinned?: boolean;
  createdBy?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  /** Tempo relativo (ex: "Há 2 horas") */
  timeLabel?: string;
  reactions?: BulletinNoteReaction[];
  /** Cor da borda esquerda */
  accentColor?: string;
  /** Cor de fundo */
  bgColor?: string;
}

interface BulletinBoardProps {
  notes?: BulletinNote[];
  currentUserId?: string;
  isOwnerOrAdmin?: boolean;
  onCreateNote?: () => void;
  onTogglePin?: (noteId: string, isPinned: boolean) => void | Promise<void>;
  onEditNote?: (note: BulletinNote) => void;
  onDeleteNote?: (noteId: string) => void | Promise<void>;
  onReactNote?: (noteId: string, emoji: string) => void | Promise<void>;
  onViewHistory?: () => void;
  className?: string;
}

// Colors use CSS custom properties so they switch correctly between light and dark mode.
const PRIORITY_STYLES: Record<ApiPriority, { label: string; bgVar: string; textVar: string }> = {
  0: { label: 'Urgente', bgVar: 'var(--chart-4)', textVar: 'var(--chart-4)' },
  1: { label: 'Alta', bgVar: 'var(--chart-5)', textVar: 'var(--chart-5)' },
  2: { label: 'Média', bgVar: 'var(--chart-5)', textVar: 'var(--chart-5)' },
  3: { label: 'Baixa', bgVar: 'var(--chart-5)', textVar: 'var(--chart-5)' },
};

const DEFAULT_ACCENT: Record<ApiPriority, string> = {
  0: 'var(--chart-4)',
  1: 'var(--chart-5)',
  2: 'var(--chart-5)',
  3: 'var(--chart-5)',
};

const DEFAULT_BG: Record<ApiPriority, string> = {
  0: 'color-mix(in srgb, var(--chart-4) 12%, var(--card))',
  1: 'color-mix(in srgb, var(--chart-5) 12%, var(--card))',
  2: 'color-mix(in srgb, var(--chart-5) 10%, var(--card))',
  3: 'color-mix(in srgb, var(--chart-5) 10%, var(--card))',
};

const QUICK_EMOJIS = ['👍', '❤️', '🎉', '👏', '💡'];

/**
 * BulletinBoard — Mural de Recados no estilo "Domestic Sanctuary".
 * Mostra cartões com borda esquerda colorida, badge de prioridade,
 * autor e reações emoji. Reusável em qualquer tela.
 */
export function BulletinBoard({
  notes = [],
  currentUserId,
  isOwnerOrAdmin = false,
  onCreateNote,
  onTogglePin,
  onEditNote,
  onDeleteNote,
  onReactNote,
  onViewHistory,
  className,
}: BulletinBoardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 outline-none',
        className
      )}
    >
      {/* Cabeçalho */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Pin
            size={18}
            className="shrink-0 text-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h3 className="font-editorial whitespace-nowrap text-xl font-bold text-foreground">
            Mural de Recados
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {onViewHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              className="font-ui flex cursor-pointer items-center gap-1.5 border-none bg-transparent font-semibold uppercase tracking-[1.2px] text-muted-foreground transition-opacity hover:opacity-70"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <History size={14} strokeWidth={1.75} aria-hidden="true" />
              Histórico
            </button>
          )}
          {onCreateNote && (
            <button
              type="button"
              onClick={onCreateNote}
              className="font-ui flex cursor-pointer items-center gap-1.5 border-none bg-transparent font-semibold uppercase tracking-[1.2px] text-primary transition-opacity hover:opacity-70"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <Plus size={14} strokeWidth={2} aria-hidden="true" />
              Criar Nota
            </button>
          )}
        </div>
      </div>

      {/* Grid de notas */}
      {notes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
          <Pin size={24} className="mb-2 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="font-ui text-sm font-medium text-muted-foreground">
            Sem recados no mural no momento.
          </p>
          <p className="font-ui text-xs text-muted-foreground/70 mt-1">
            Clique em "Criar Nota" para deixar um aviso para a família.
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              currentUserId={currentUserId}
              isOwnerOrAdmin={isOwnerOrAdmin}
              onTogglePin={onTogglePin}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
              onReactNote={onReactNote}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  currentUserId,
  isOwnerOrAdmin = false,
  onTogglePin,
  onEditNote,
  onDeleteNote,
  onReactNote,
}: {
  note: BulletinNote;
  currentUserId?: string;
  isOwnerOrAdmin?: boolean;
  onTogglePin?: (noteId: string, isPinned: boolean) => void | Promise<void>;
  onEditNote?: (note: BulletinNote) => void;
  onDeleteNote?: (noteId: string) => void | Promise<void>;
  onReactNote?: (noteId: string, emoji: string) => void | Promise<void>;
}) {
  const priority = PRIORITY_STYLES[note.priority] ?? PRIORITY_STYLES[3];
  const accentColor = note.accentColor ?? DEFAULT_ACCENT[note.priority ?? 3];
  const bgColor =
    note.bgColor ??
    DEFAULT_BG[note.priority ?? 3] ??
    'color-mix(in srgb, var(--muted) 60%, var(--card))';

  // Permissões conforme regras de negócio:
  // - Editar: apenas o criador
  const canEdit = Boolean(currentUserId) && note.createdBy === currentUserId;
  // - Excluir: Owner, Admin ou o próprio criador
  const canDelete = isOwnerOrAdmin || (Boolean(currentUserId) && note.createdBy === currentUserId);
  // - Pinar/Desafixar: apenas Owner ou Admin
  const canPin = isOwnerOrAdmin;

  const [pickerOpen, setPickerOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const groupedReactions = useMemo(() => {
    if (!note.reactions || note.reactions.length === 0) return [];
    const map = new Map<
      string,
      {
        emoji: string;
        count: number;
        users: Array<{ name?: string; avatar?: string }>;
        userReacted: boolean;
      }
    >();

    for (const r of note.reactions) {
      const existing = map.get(r.emoji);
      const isCurrentUser = Boolean(currentUserId && r.userId === currentUserId);
      const userInfo = { name: r.userName, avatar: r.userAvatar };

      if (existing) {
        existing.count += r.count ?? 1;
        if (r.userName) existing.users.push(userInfo);
        if (isCurrentUser) existing.userReacted = true;
      } else {
        map.set(r.emoji, {
          emoji: r.emoji,
          count: r.count ?? 1,
          users: r.userName ? [userInfo] : [],
          userReacted: isCurrentUser,
        });
      }
    }
    return Array.from(map.values());
  }, [note.reactions, currentUserId]);

  return (
    <motion.div
      className="flex min-h-[10rem] flex-col justify-between overflow-hidden rounded-2xl pb-2.5 pt-4"
      style={{
        background: bgColor,
        borderLeft: `2px solid ${accentColor}`,
        paddingLeft: 'calc(1rem - 2px)',
        paddingRight: '1rem',
      }}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
        },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] } }}
    >
      {/* Topo: badge de prioridade + ações (editar, excluir, fixar) */}
      <div className="flex items-start justify-between pb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="font-ui rounded-lg px-2.5 py-1 font-semibold uppercase tracking-[0.9px]"
            style={{
              fontSize: 'var(--text-xs)',
              background: `color-mix(in srgb, ${priority.bgVar} 15%, var(--card))`,
              color: priority.textVar,
            }}
          >
            {priority.label}
          </span>
          {note.isPinned && (
            <span
              className="font-ui flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-destructive bg-destructive/10"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <Pin size={12} className="fill-destructive" />
              Fixado
            </span>
          )}
        </div>

        <div className="-mr-1 flex items-center gap-1">
          {canEdit && onEditNote && (
            <button
              type="button"
              onClick={() => onEditNote(note)}
              aria-label="Editar recado"
              title="Editar (Criador)"
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pencil size={15} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
          {canDelete && onDeleteNote && (
            <button
              type="button"
              onClick={() => onDeleteNote(note.id)}
              aria-label="Excluir recado"
              title="Excluir (Admin/Criador)"
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
          {canPin && onTogglePin && (
            <button
              type="button"
              onClick={() => onTogglePin(note.id, Boolean(note.isPinned))}
              aria-label={note.isPinned ? 'Desafixar nota' : 'Fixar nota'}
              title={note.isPinned ? 'Desafixar (Admin)' : 'Fixar (Admin)'}
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                color: note.isPinned ? 'var(--destructive)' : 'var(--muted-foreground)',
              }}
            >
              <Pin size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Mensagem */}
      <div className="flex-1 overflow-hidden">
        <div className="font-ui line-clamp-3 text-sm leading-snug text-foreground/80">
          {note.content}
        </div>
      </div>

      {/* Rodapé: autor + reações */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 pt-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {note.authorAvatar ? (
            <img
              src={note.authorAvatar}
              alt={note.authorName || 'Criador'}
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold"
              aria-hidden="true"
              style={{
                fontSize: 'var(--text-xs)',
                background: accentColor,
                color: 'var(--card)',
              }}
            >
              {getInitials(note.authorName)}
            </div>
          )}
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            {note.authorName && (
              <span
                className="font-ui truncate font-semibold uppercase tracking-[1px]"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: note.isPinned ? accentColor : 'var(--foreground)',
                }}
              >
                {note.authorName}
              </span>
            )}
            {note.timeLabel && (
              <span
                className="font-ui shrink-0 text-muted-foreground"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {note.timeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Reações */}
        <div className="flex items-center gap-1.5">
          {groupedReactions.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onReactNote?.(note.id, r.emoji)}
              title={
                r.users.length > 0
                  ? r.users.map((u) => u.name).filter(Boolean).join(', ')
                  : `Reação ${r.emoji}`
              }
              aria-label={`Reagir com ${r.emoji}, ${r.count} reações`}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors',
                r.userReacted
                  ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              )}
            >
              <span aria-hidden="true">{r.emoji}</span>
              <span className="font-ui font-semibold">{r.count}</span>
            </button>
          ))}

          {onReactNote && (
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Adicionar reação"
                  title="Reagir"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Smile size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1.5" side="top">
                <div className="flex items-center gap-1">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onReactNote(note.id, emoji);
                        setPickerOpen(false);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors hover:bg-muted"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export { NoteCard };
export default BulletinBoard;
