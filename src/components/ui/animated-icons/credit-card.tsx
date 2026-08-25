'use client';

import type { Variants } from 'framer-motion';
import { motion, useAnimation } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle } from 'react';

import { cn } from '@/lib/utils';

export interface CreditCardIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CreditCardIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const CARD_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.4, opacity: { duration: 0.1 } },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { duration: 0.5, opacity: { duration: 0.1 } },
  },
};

const STRIPE_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.2 },
  },
  animate: {
    opacity: [0, 1],
    scaleX: [0, 1],
    transition: { delay: 0.35, duration: 0.3, opacity: { duration: 0.1, delay: 0.35 } },
  },
};

const DOT_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  animate: {
    opacity: [0, 1],
    scale: [0, 1],
    transition: { delay: 0.45, duration: 0.25 },
  },
};

const CreditCardIcon = forwardRef<CreditCardIconHandle, CreditCardIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
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
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.rect
            animate={controls}
            height="14"
            initial="normal"
            rx="2"
            variants={CARD_VARIANTS}
            width="20"
            x="2"
            y="5"
          />
          <motion.line
            animate={controls}
            initial="normal"
            variants={STRIPE_VARIANTS}
            x1="2"
            x2="22"
            y1="10"
            y2="10"
          />
          <motion.circle
            animate={controls}
            cx="7"
            cy="15"
            fill="currentColor"
            initial="normal"
            r="1"
            stroke="none"
            variants={DOT_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

CreditCardIcon.displayName = 'CreditCardIcon';

export { CreditCardIcon };
