"use client";

import { motion, useAnimation } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface BellIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BellIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const BellIcon = forwardRef<BellIconHandle, BellIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 20, ...props }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    }));

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start("animate");
        onMouseEnter?.(e);
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start("normal");
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
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Clapper (bottom dot) — bounces independently */}
          <motion.path
            d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
            animate={controls}
            variants={{
              normal: { rotate: 0, originX: "12px", originY: "2px" },
              animate: {
                rotate: [0, -20, 20, -14, 14, -8, 8, -4, 4, 0],
                transition: { duration: 0.7, ease: "easeInOut" },
              },
            }}
            style={{ transformOrigin: "12px 2px" }}
          />
          <motion.path
            d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
            animate={controls}
            variants={{
              normal: { rotate: 0, y: 0 },
              animate: {
                rotate: [0, -20, 20, -14, 14, -8, 8, -4, 4, 0],
                transition: { duration: 0.7, ease: "easeInOut" },
              },
            }}
            style={{ transformOrigin: "12px 2px" }}
          />
        </svg>
      </div>
    );
  }
);

BellIcon.displayName = "BellIcon";

export { BellIcon };
