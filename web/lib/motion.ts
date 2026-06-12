import type { Variants, Transition } from "framer-motion";

/**
 * Motion language, inherited from the dashboard.
 * One easing curve (ease-out-quart), short durations, motion only ever
 * signals a state change or entrance — never decoration. See PRODUCT.md.
 */
export const EASE_QUART = [0.16, 1, 0.3, 1] as const;

export const transition = (delay = 0, duration = 0.5): Transition => ({
  duration,
  delay,
  ease: EASE_QUART,
});

/** Entrance: a short rise + fade, the same gesture the dashboard panels use. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: transition(i * 0.06, 0.55),
  }),
};

/** Staggered container for lists of panels / features. */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: transition(0, 0.5) },
};

export const VIEWPORT = { once: true, amount: 0.3 } as const;
