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

const PRIORITY_THEMES: Record<
  ApiPriority,
  { label: string; badgeBg: string; badgeText: string; borderAccent: string }
> = {
  0: {
    label: 'Urgente',
    badgeBg: 'bg-destructive/15',
    badgeText: 'text-destructive',
    borderAccent: 'border-l-destructive',
  },
  1: {
    label: 'Alta',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-600 dark:text-amber-400',
    borderAccent: 'border-l-amber-500',
  },
  2: {
    label: 'Média',
    badgeBg: 'bg-primary/15',
    badgeText: 'text-primary',
    borderAccent: 'border-l-primary',
  },
  3: {
    label: 'Baixa',
    badgeBg: 'bg-chart-2/15',
    badgeText: 'text-chart-2',
    borderAccent: 'border-l-chart-2',
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
        'flex h-full flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs',
        className
      )}
    >
      <div>
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <Pin size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-foreground">
                Mural de Recados
              </h3>
              <p className="font-ui text-xs text-muted-foreground">
                Avisos e comunicados da família
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="font-ui inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <History size={13} />
                <span>Histórico</span>
              </button>
            )}

            {onCreateNote && (
              <button
                type="button"
                onClick={onCreateNote}
                className="font-ui inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-bold text-black shadow-xs transition-all hover:brightness-105 active:scale-95"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Criar Nota</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid de Cartões de Recado */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-2">
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
                className="mt-3 font-ui text-xs font-bold text-primary hover:underline"
              >
                + Deixar primeiro recado
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <span>{notes.length} {notes.length === 1 ? 'recado ativo' : 'recados ativos'}</span>
          <span>Atualizado automaticamente</span>
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
  const theme = PRIORITY_THEMES[note.priority ?? 3] ?? PRIORITY_THEMES[3];

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
        'group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/30 p-4 transition-all hover:bg-card hover:shadow-xs border-l-4',
        theme.borderAccent
      )}
    >
      <div>
        {/* Top bar: Priority badge, Pinned tag & Actions */}
        <div className="flex items-center justify-between gap-1.5 pb-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-ui rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                theme.badgeBg,
                theme.badgeText
              )}
            >
              {theme.label}
            </span>

            {note.isPinned && (
              <span className="flex items-center gap-1 rounded-md bg-secondary/15 px-1.5 py-0.5 text-[10px] font-bold text-secondary">
                <Pin size={10} className="fill-secondary" />
                Fixado
              </span>
            )}
          </div>

          {/* Quick Note Actions */}
          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
            {canPin && onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(note.id, Boolean(note.isPinned))}
                title={note.isPinned ? 'Desafixar nota' : 'Fixar no topo'}
                className={cn(
                  'flex size-6 items-center justify-center rounded-md transition-colors',
                  note.isPinned
                    ? 'text-secondary hover:bg-secondary/10'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Pin size={12} className={note.isPinned ? 'fill-secondary' : ''} />
              </button>
            )}

            {canEdit && onEditNote && (
              <button
                type="button"
                onClick={() => onEditNote(note)}
                title="Editar recado"
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil size={12} />
              </button>
            )}

            {canDelete && onDeleteNote && (
              <button
                type="button"
                onClick={() => onDeleteNote(note.id)}
                title="Excluir recado"
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Message Content */}
        <p className="font-ui text-xs font-normal leading-relaxed text-foreground/90 whitespace-pre-wrap line-clamp-4">
          {note.content}
        </p>
      </div>

      {/* Bottom bar: Author & Reactions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5">
        {/* Author info */}
        <div className="flex items-center gap-1.5 min-w-0">
          {note.authorAvatar ? (
            <img
              src={note.authorAvatar}
              alt={note.authorName || 'Membro'}
              className="size-5 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary shrink-0">
              {initials}
            </div>
          )}
          <span className="truncate text-[11px] font-semibold text-foreground/80">
            {note.authorName || 'Família'}
          </span>
          {note.timeLabel && (
            <span className="text-[10px] text-muted-foreground/70 shrink-0">
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
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors',
                r.userReacted
                  ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{r.emoji}</span>
              <span className="text-[10px]">{r.count}</span>
            </button>
          ))}

          {onReactNote && (
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Reagir"
                  className="flex size-6 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                      className="flex size-7 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted"
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
