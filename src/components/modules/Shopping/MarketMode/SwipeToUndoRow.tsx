import { motion, useAnimationControls, useMotionValue, useTransform } from 'framer-motion';
import { Undo2 } from 'lucide-react';
import { useRef } from 'react';

interface SwipeToUndoRowProps {
  onUndo: () => void;
  children: React.ReactNode;
  className?: string;
}

const SWIPE_TRIGGER_DISTANCE = -88;
const SWIPE_MAX_DRAG = -110;

export function SwipeToUndoRow({ onUndo, children, className }: SwipeToUndoRowProps) {
  const controls = useAnimationControls();
  const draggedRef = useRef(false);
  const x = useMotionValue(0);
  const revealOpacity = useTransform(x, [0, SWIPE_MAX_DRAG], [0, 1]);

  const settle = (didSwipe: boolean) => {
    const target = didSwipe ? SWIPE_MAX_DRAG : 0;
    controls
      .start({
        x: target,
        transition: didSwipe
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 500, damping: 35 },
      })
      .then(() => {
        if (didSwipe) onUndo();
      });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div
        style={{ opacity: revealOpacity }}
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center rounded-2xl bg-amber-500/90 text-white"
      >
        <span className="flex flex-col items-center gap-0.5 text-[11px] font-bold">
          <Undo2 size={16} strokeWidth={2.5} />
          Desfazer
        </span>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: SWIPE_MAX_DRAG, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        style={{ x }}
        animate={controls}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={(_, info) => {
          settle(info.offset.x <= SWIPE_TRIGGER_DISTANCE);
          // Evita que o clique subsequente (ghost click pós-drag) dispare o onClick do card
          setTimeout(() => {
            draggedRef.current = false;
          }, 0);
        }}
        onLostPointerCapture={() => {
          // Rede de segurança: se o gesto perder o ponteiro sem disparar onDragEnd
          // (ex.: automação ou troca de foco), garante que a linha não fique presa.
          if (draggedRef.current) {
            settle(false);
            draggedRef.current = false;
          }
        }}
        onClick={(e) => {
          if (draggedRef.current) {
            e.stopPropagation();
            e.preventDefault();
            return;
          }
          onUndo();
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
