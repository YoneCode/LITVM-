"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_QUART } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Minimal trend sparkline — no charting dependency.
 * Draws a normalized polyline + soft area fill. The line draws itself once
 * (stroke-dashoffset) to signal "this is live data arriving", then rests.
 */
export function Sparkline({
  data,
  width = 96,
  height = 32,
  className,
  tone = "accent",
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  tone?: "accent" | "success" | "error";
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const stroke =
    tone === "success" ? "var(--success)" : tone === "error" ? "var(--error)" : "var(--accent)";

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 2;
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (d - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${id})`} />
      <motion.polyline
        points={line}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0.4 }}
        animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE_QUART }}
      />
    </svg>
  );
}
