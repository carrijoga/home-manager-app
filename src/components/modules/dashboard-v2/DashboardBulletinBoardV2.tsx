import { motion } from 'framer-motion';
import { History, MessageSquare, Pencil, Pin, Plus, Smile, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ApiPriority } from '@/types';

export interface BulletinNoteV2Reaction {
  reactionId?: string;
  noticeId?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  emoji: string;
  createdAt?: string;
  count?: number;
}

export interface BulletinNoteV2 {
  id: string;
  priority: ApiPriority;
  content: React.ReactNode;
  isPinned?: boolean;
  createdBy?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  timeLabel?: string;
  reactions?: BulletinNoteV2Reaction[];
}

interface DashboardBulletinBoardV2Props {
  notes?: BulletinNoteV2[];
  currentUserId?: string;
  isOwnerOrAdmin?: boolean;
  onCreateNote?: () => void;
  onTogglePin?: (noteId: string, isPinned: boolean) => void | Promise<void>;
  onEditNote?: (note: BulletinNoteV2) => void;
  onDeleteNote?: (noteId: string) => void | Promise<void>;
  onReactNote?: (noteId: string, emoji: string) => void | Promise<void>;
  onViewHistory?: () => void;
  className?: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '🎉', '👏', '💡', '☕'];

const POSTIT_THEMES: Record<
  ApiPriority,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  0: {
    label: 'Urgente',
    bg: 'bg-[#fef5cd] dark:bg-[#3d3312]/70',
    border: 'border-[#f3de7f] dark:border-[#69541a]',
    text: 'text-[#453305] dark:text-[#fcedb3]',
    badgeBg: 'bg-amber-200/80 text-amber-950 dark:bg-amber-800/60 dark:text-amber-100',
    badgeText: 'text-amber-950 dark:text-amber-100',
  },
  1: {
    label: 'Alta',
    bg: 'bg-[#fde8df] dark:bg-[#3d1c14]/70',
    border: 'border-[#f8c5b2] dark:border-[#6a3324]',
    text: 'text-[#5e2617] dark:text-[#f8a892]',
    badgeBg: 'bg-rose-200/80 text-rose-950 dark:bg-rose-800/60 dark:text-rose-100',
    badgeText: 'text-rose-950 dark:text-rose-100',
  },
  2: {
    label: 'Média',
    bg: 'bg-[#e6f4fb] dark:bg-[#152e3d]/70',
    border: 'border-[#c3e5f7] dark:border-[#214b63]',
    text: 'text-[#134563] dark:text-[#93d2f6]',
    badgeBg: 'bg-sky-200/80 text-sky-950 dark:bg-sky-800/60 dark:text-sky-100',
    badgeText: 'text-sky-950 dark:text-sky-100',
  },
  3: {
    label: 'Baixa',
    bg: 'bg-[#eaf6eb] dark:bg-[#1b331a]/70',
    border: 'border-[#c7e8ca] dark:border-[#2d562b]',
    text: 'text-[#1c4d1b] dark:text-[#a0db9e]',
    badgeBg: 'bg-emerald-200/80 text-emerald-950 dark:bg-emerald-800/60 dark:text-emerald-100',
    badgeText: 'text-emerald-950 dark:text-emerald-100',
  },
};

export function DashboardBulletinBoardV2({
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
}: DashboardBulletinBoardV2Props) {
  return (
    <div
      className={cn(
        'relative flex h-full flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-card',
        className
      )}
    >
      <div>
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50/80 p-1 dark:bg-amber-950/30">
              <img
                src="/icons/clay-optimized/bulletin_board.webp"
                alt="Mural de Recados"
                className="size-full object-contain"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))' }}
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                Mural de Recados
              </h3>
              <p className="font-ui text-xs text-muted-foreground">
                Post-its e bilhetes da família
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground active:scale-95 cursor-pointer"
                title="Histórico de recados"
                aria-label="Histórico de recados"
              >
                <History size={16} strokeWidth={1.75} />
              </button>
            )}

            {onCreateNote && (
              <button
                type="button"
                onClick={onCreateNote}
                className="font-ui inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 dark:bg-amber-800/60 dark:text-amber-100 px-3 py-1 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>+ Post-it</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid de Cartões de Recado */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-8 text-center mt-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 mb-2">
              <MessageSquare size={20} />
            </div>
            <p className="font-ui text-sm font-semibold text-foreground">
              Mural livre no momento!
            </p>
            <p className="font-ui text-xs text-muted-foreground mt-0.5 max-w-xs">
              Deixe um recado carinhoso ou um aviso importante para todos no ninho.
            </p>
            {onCreateNote && (
              <button
                type="button"
                onClick={onCreateNote}
                className="mt-3 font-ui text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                + Deixar primeiro recado
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5 mt-3.5">
            {notes.map((note) => (
              <NoticeCardV2
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
          </div>
        )}
      </div>

      {/* Footer informativo */}
      {notes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-dashed border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{notes.length} {notes.length === 1 ? 'recado no mural' : 'recados no mural'}</span>
          {onViewHistory ? (
            <button
              type="button"
              onClick={onViewHistory}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              Ver histórico &rarr;
            </button>
          ) : (
            <span>Atualizado automaticamente</span>
          )}
        </div>
      )}
    </div>
  );
}

function NoticeCardV2({
  note,
  currentUserId,
  isOwnerOrAdmin = false,
  onTogglePin,
  onEditNote,
  onDeleteNote,
  onReactNote,
}: {
  note: BulletinNoteV2;
  currentUserId?: string;
  isOwnerOrAdmin?: boolean;
  onTogglePin?: (id: string, isPinned: boolean) => void | Promise<void>;
  onEditNote?: (note: BulletinNoteV2) => void;
  onDeleteNote?: (id: string) => void | Promise<void>;
  onReactNote?: (id: string, emoji: string) => void | Promise<void>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const theme = POSTIT_THEMES[note.priority ?? 3] ?? POSTIT_THEMES[3];

  const canEdit = Boolean(currentUserId) && note.createdBy === currentUserId;
  const canDelete = isOwnerOrAdmin || (Boolean(currentUserId) && note.createdBy === currentUserId);
  const canPin = isOwnerOrAdmin;

  const groupedReactions = useMemo(() => {
    if (!note.reactions || note.reactions.length === 0) return [];
    const map = new Map<
      string,
      { emoji: string; count: number; userReacted: boolean }
    >();

    for (const r of note.reactions) {
      const existing = map.get(r.emoji);
      const isCurrentUser = Boolean(currentUserId && r.userId === currentUserId);

      if (existing) {
        existing.count += r.count ?? 1;
        if (isCurrentUser) existing.userReacted = true;
      } else {
        map.set(r.emoji, {
          emoji: r.emoji,
          count: r.count ?? 1,
          userReacted: isCurrentUser,
        });
      }
    }
    return Array.from(map.values());
  }, [note.reactions, currentUserId]);

  const initials = useMemo(() => {
    if (!note.authorName) return '🪺';
    return note.authorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [note.authorName]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        theme.bg,
        theme.border,
        theme.text
      )}
    >
      {/* Washi Tape listrada no topo para bilhetes fixados */}
      {note.isPinned && (
        <div
          className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-18 rounded-xs opacity-90 shadow-2xs"
          style={{
            background:
              'repeating-linear-gradient(-45deg, rgba(235, 120, 90, 0.45), rgba(235, 120, 90, 0.45) 8px, rgba(255, 255, 255, 0.5) 8px, rgba(255, 255, 255, 0.5) 16px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          aria-hidden="true"
        />
      )}

      <div>
        {/* Top bar: Priority badge, Pinned tag & Actions */}
        <div className="flex items-center justify-between gap-1.5 pb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                'font-ui rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                theme.badgeBg
              )}
            >
              {note.isPinned ? `📌 ${theme.label} • FIXADO` : theme.label}
            </span>
          </div>

          {/* Quick Note Actions */}
          <div className="flex items-center gap-0.5 opacity-75 group-hover:opacity-100 transition-opacity">
            {canPin && onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(note.id, Boolean(note.isPinned))}
                title={note.isPinned ? 'Desafixar nota' : 'Fixar no topo'}
                className={cn(
                  'flex size-5.5 items-center justify-center rounded-md transition-colors cursor-pointer',
                  note.isPinned
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10'
                )}
              >
                <Pin size={11} className={note.isPinned ? 'fill-current' : ''} />
              </button>
            )}

            {canEdit && onEditNote && (
              <button
                type="button"
                onClick={() => onEditNote(note)}
                title="Editar recado"
                className="flex size-5.5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10 cursor-pointer"
              >
                <Pencil size={11} />
              </button>
            )}

            {canDelete && onDeleteNote && (
              <button
                type="button"
                onClick={() => onDeleteNote(note.id)}
                title="Excluir recado"
                className="flex size-5.5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive cursor-pointer"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Message Content */}
        <p className="font-ui text-xs font-medium leading-relaxed whitespace-pre-wrap line-clamp-4 pt-0.5">
          {note.content}
        </p>
      </div>

      {/* Bottom bar: Author & Reactions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 dark:border-white/10 pt-2.5">
        {/* Author info */}
        <div className="flex items-center gap-1.5 min-w-0">
          {note.authorAvatar ? (
            <img
              src={note.authorAvatar}
              alt={note.authorName || 'Membro'}
              className="size-4.5 rounded-full object-cover shrink-0 ring-1 ring-black/10"
            />
          ) : (
            <div className="flex size-4.5 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-[8px] font-bold shrink-0">
              {initials}
            </div>
          )}
          <span className="truncate text-[11px] font-bold">
            {note.authorName?.split(' ')[0] || 'Família'}
          </span>
          {note.timeLabel && (
            <span className="text-[10px] opacity-75 shrink-0">
              • {note.timeLabel}
            </span>
          )}
        </div>

        {/* Reactions row */}
        <div className="flex items-center gap-1">
          {groupedReactions.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onReactNote?.(note.id, r.emoji)}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-2xs transition-all active:scale-110 cursor-pointer',
                r.userReacted
                  ? 'bg-white/95 text-foreground ring-1 ring-primary/40 dark:bg-black/80'
                  : 'bg-white/70 hover:bg-white text-foreground/80 dark:bg-black/50 dark:hover:bg-black/70'
              )}
            >
              <span>{r.emoji}</span>
              <span className="text-[10px] tabular-nums">{r.count}</span>
            </button>
          ))}

          {onReactNote && (
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Reagir com emoji"
                  className="flex size-5.5 items-center justify-center rounded-full bg-white/70 text-foreground/70 transition-colors hover:bg-white hover:text-foreground dark:bg-black/40 cursor-pointer"
                >
                  <Smile size={12} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" side="top">
                <div className="flex items-center gap-0.5">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onReactNote(note.id, emoji);
                        setPickerOpen(false);
                      }}
                      className="flex size-7 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted cursor-pointer"
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
