"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { reveal, VIEWPORT } from "@/lib/motion";

type RevealProps = HTMLMotionProps<"div"> & {
  /** stagger index — multiplies the entrance delay */
  index?: number;
  as?: "div" | "section" | "li" | "ul" | "header" | "footer";
};

/**
 * Scroll-triggered entrance. One gesture (rise + fade), one easing curve.
 * Honors reduced-motion via the global CSS override.
 */
export function Reveal({ index = 0, children, className, ...rest }: RevealProps) {
  return (
    <motion.div
      variants={reveal}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
