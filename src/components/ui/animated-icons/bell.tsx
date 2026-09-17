'use client';

import type { Variants } from 'framer-motion';
import { motion, useAnimation } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle } from 'react';

import { cn } from '@/lib/utils';

export interface BellIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BellIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const BELL_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    transition: { duration: 0.2 },
  },
  animate: {
    rotate: [0, -22, 22, -16, 16, -9, 9, -4, 4, 0],
    transition: {
      duration: 0.7,
      ease: 'easeInOut',
    },
  },
};

const CLAPPER_VARIANTS: Variants = {
  normal: {
    x: 0,
    transition: { duration: 0.2 },
  },
  animate: {
    x: [0, -3, 3, -2, 2, -1, 1, 0],
    transition: {
      duration: 0.7,
      ease: 'easeInOut',
    },
  },
};

const BellIcon = forwardRef<BellIconHandle, BellIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 20, ...props }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    }));

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start('animate');
        onMouseEnter?.(e);
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start('normal');
        onMouseLeave?.(e);
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn('inline-flex items-center justify-center cursor-pointer', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          whileHover="animate"
          variants={BELL_VARIANTS}
          style={{ transformOrigin: 'top center', originX: '50%', originY: '10%' }}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible pointer-events-none"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <motion.path
            d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
            variants={CLAPPER_VARIANTS}
          />
        </motion.svg>
      </div>
    );
  }
);

BellIcon.displayName = 'BellIcon';

export { BellIcon };
