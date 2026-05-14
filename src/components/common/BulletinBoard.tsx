import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ApiPriority } from "@/types";

export interface BulletinNote {
  id: string;
  priority: ApiPriority;
  content: ReactNode;
  isPinned?: boolean;
  authorName?: string;
  authorAvatar?: string;
  /** Tempo relativo (ex: "Há 2 horas") */
  timeLabel?: string;
  reactions?: Array<{ emoji: string; count: number }>;
  /** Cor da borda esquerda */
  accentColor?: string;
  /** Cor de fundo */
  bgColor?: string;
}

interface BulletinBoardProps {
  notes?: BulletinNote[];
  onCreateNote?: () => void;
  onTogglePin?: (noteId: string, isPinned: boolean) => void | Promise<void>;
  className?: string;
}

// Colors use CSS custom properties so they switch correctly between light and dark mode.
const PRIORITY_STYLES: Record<
  ApiPriority,
  { label: string; bgVar: string; textVar: string }
> = {
  0:  { label: "Urgente",  bgVar: "var(--chart-4)",  textVar: "var(--chart-4)"  },
  1:  { label: "Alta",      bgVar: "var(--chart-5)",  textVar: "var(--chart-5)"  },
  2:  { label: "Média",     bgVar: "var(--chart-5)",  textVar: "var(--chart-5)"  },
  3:  { label: "Baixa",     bgVar: "var(--chart-5)",  textVar: "var(--chart-5)"  },
};

const DEFAULT_ACCENT: Record<ApiPriority, string> = {
  0:  "var(--chart-4)",
  1:  "var(--chart-5)",
  2:  "var(--chart-5)",
  3:  "var(--chart-5)",
};

const DEFAULT_BG: Record<ApiPriority, string> = {
  0:  "color-mix(in srgb, var(--chart-4) 12%, var(--card))",
  1:  "color-mix(in srgb, var(--chart-5) 12%, var(--card))",
  2:  "color-mix(in srgb, var(--chart-5) 10%, var(--card))",
  3:  "color-mix(in srgb, var(--chart-5) 10%, var(--card))",
};

/**
 * BulletinBoard — Mural de Recados no estilo "Domestic Sanctuary".
 * Mostra cartões com borda esquerda colorida, badge de prioridade,
 * autor e reações emoji. Reusável em qualquer tela.
 */
export function BulletinBoard({
  notes = [],
  onCreateNote,
  onTogglePin,
  className,
}: BulletinBoardProps) {
  return (
    <div className={cn(
      "flex flex-col gap-6 p-6 rounded-3xl h-full bg-card border border-border outline-none", 
      className
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Pin size={18} className="text-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="font-editorial font-bold text-foreground text-xl whitespace-nowrap">
            Mural de Recados
          </h3>
        </div>
        {onCreateNote && (
          <button
            type="button"
            onClick={onCreateNote}
            className="font-ui font-semibold text-primary uppercase tracking-[1.2px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Criar Nota
          </button>
        )}
      </div>

      {/* Grid de notas */}
      {notes.length === 0 ? (
        <p className="font-ui text-sm text-muted-foreground/50 leading-relaxed">
          Sem recados ainda. Use o mural para deixar avisos para a família.
        </p>
      ) : (
        <motion.div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        >
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onTogglePin={onTogglePin} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onTogglePin,
}: {
  note: BulletinNote;
  onTogglePin?: (noteId: string, isPinned: boolean) => void | Promise<void>;
}) {
  const priority = PRIORITY_STYLES[note.priority] ?? PRIORITY_STYLES[3];
  const accentColor = note.accentColor ?? DEFAULT_ACCENT[note.priority ?? 3];
  const bgColor = note.bgColor ?? DEFAULT_BG[note.priority ?? 3] ?? "color-mix(in srgb, var(--muted) 60%, var(--card))";

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      className="flex flex-col justify-between min-h-[10rem] rounded-2xl pt-4 pb-2.5 overflow-hidden"
      style={{
        background: bgColor,
        borderLeft: `2px solid ${accentColor}`,
        paddingLeft: "calc(1rem - 2px)",
        paddingRight: "1rem",
      }}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] } }}
    >
      {/* Topo: badge de prioridade + fixar */}
      <div className="flex items-start justify-between pb-2">
        <span
          className="font-ui font-semibold uppercase px-2.5 py-1 rounded-lg tracking-[0.9px]"
          style={{
            fontSize: "var(--text-xs)",
            background: `color-mix(in srgb, ${priority.bgVar} 15%, var(--card))`,
            color: priority.textVar,
          }}
        >
          {priority.label}
        </span>
        {onTogglePin && (
          <button
            type="button"
            onClick={() => onTogglePin(note.id, Boolean(note.isPinned))}
            aria-label={note.isPinned ? "Desafixar nota" : "Fixar nota"}
            title={note.isPinned ? "Desafixar" : "Fixar"}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 -mr-1 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
            style={{
              color: note.isPinned ? "var(--destructive)" : "var(--muted-foreground)",
            }}
          >
            <Pin size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Mensagem */}
      <div className="flex-1 overflow-hidden">
        <div className="font-ui text-sm text-foreground/80 leading-snug line-clamp-3">
          {note.content}
        </div>
      </div>

      {/* Rodapé: autor + reações */}
      <div className="flex items-center justify-between pt-4 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {note.authorAvatar ? (
            <img
              src={note.authorAvatar}
              alt={note.authorName || "Autor"}
              className="w-6 h-6 rounded-full shrink-0 object-cover"
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold"
              aria-hidden="true"
              style={{
                fontSize: "var(--text-xs)",
                background: accentColor,
                color: "var(--card)",
              }}
            >
              {getInitials(note.authorName)}
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            {note.authorName && (
              <span
                className="font-ui font-semibold uppercase tracking-[1px] truncate"
                style={{
                  fontSize: "var(--text-xs)",
                  color: note.isPinned ? accentColor : "var(--foreground)",
                }}
              >
                {note.authorName}
              </span>
            )}
            {note.timeLabel && (
              <span
                className="font-ui text-muted-foreground shrink-0"
                style={{ fontSize: "var(--text-xs)" }}
              >
                {note.timeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Reações */}
        {note.reactions && note.reactions.length > 0 && (
          <div className="flex items-center gap-2">
            {note.reactions.map((r, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Reagir com ${r.emoji}, ${r.count} reação${r.count !== 1 ? 'ões' : ''}`}
                className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-full transition-opacity hover:opacity-80 bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <span aria-hidden="true">{r.emoji}</span>
                <span className="font-ui font-semibold text-muted-foreground" style={{ fontSize: "var(--text-xs)" }}>
                  {r.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { NoteCard };
export default BulletinBoard;
