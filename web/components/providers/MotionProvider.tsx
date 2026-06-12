"use client";

import { MotionConfig } from "framer-motion";

/**
 * Makes every Framer Motion component honour the OS "reduce motion" setting.
 * Framer's JS-driven animations bypass the CSS `prefers-reduced-motion` query,
 * so `reducedMotion="user"` is required for real WCAG 2.3.3 compliance — it
 * disables transform/layout animation while preserving opacity for legibility.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
