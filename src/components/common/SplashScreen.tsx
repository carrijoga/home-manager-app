import { motion, useReducedMotion } from 'framer-motion';

export function SplashScreen() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]"
      initial={{ opacity: 1 }}
      exit={{ opacity: reduced ? 0 : 0, transition: { duration: reduced ? 0.01 : 0.5, ease: 'easeInOut' } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.01 : 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col items-center gap-4"
      >
        {/* Icon */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600"
          style={{ boxShadow: '0 8px 32px rgba(217,119,6,0.45)' }}
        >
          <span className="text-4xl" role="img" aria-label="Ninho">🏠</span>
        </div>

        {/* Wordmark */}
        <h1 className="text-3xl font-extrabold tracking-widest text-white">
          Ninho
        </h1>

        {/* Tagline */}
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
          Sua casa, organizada
        </p>
      </motion.div>
    </motion.div>
  );
}
