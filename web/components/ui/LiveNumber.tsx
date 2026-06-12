"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * A number that behaves like live data, not static text.
 * - `accrualPerSec`: increments continuously (a streaming reward).
 * - otherwise: tweens smoothly when `value` changes (a state update).
 * Motion is functional — it communicates that a value moved. Reduced-motion
 * users get the final value with no animation.
 */
export function LiveNumber({
  value,
  precision = 2,
  accrualPerSec = 0,
  className,
  suffix,
}: {
  value: number;
  precision?: number;
  accrualPerSec?: number;
  className?: string;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const raf = useRef<number | null>(null);
  const current = useRef(value);
  const target = useRef(value);
  const lastTs = useRef<number | null>(null);

  // Continuous accrual loop
  useEffect(() => {
    if (!accrualPerSec || reduce) return;
    current.current = value;
    const tick = (ts: number) => {
      if (lastTs.current == null) lastTs.current = ts;
      const dt = (ts - lastTs.current) / 1000;
      lastTs.current = ts;
      current.current += accrualPerSec * dt;
      setDisplay(current.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      lastTs.current = null;
    };
  }, [accrualPerSec, value, reduce]);

  // Tween on value change (only when not accruing)
  useEffect(() => {
    if (accrualPerSec) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    target.current = value;
    const from = current.current;
    const diff = value - from;
    if (Math.abs(diff) < 1e-9) return;
    const dur = 600;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      // ease-out-quart, the shared curve
      const eased = 1 - Math.pow(1 - t, 4);
      current.current = from + diff * eased;
      setDisplay(current.current);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, accrualPerSec, reduce]);

  return (
    <span className={cn("nums tabular-nums", className)}>
      {formatNumber(display, precision)}
      {suffix ? <span className="text-fg-3">{suffix}</span> : null}
    </span>
  );
}
