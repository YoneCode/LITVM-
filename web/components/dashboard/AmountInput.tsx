"use client";

import { ethers } from "ethers";
import { fmtToken } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Parse a user string to wei; returns null if invalid/<=0. */
export function parseAmount(value: string): bigint | null {
  if (!value || Number(value) <= 0) return null;
  try {
    const wei = ethers.parseEther(value);
    return wei > 0n ? wei : null;
  } catch {
    return null;
  }
}

export function AmountInput({
  label,
  value,
  onChange,
  suffix,
  balance,
  fills = [25, 50, 100],
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
  balance?: bigint;
  fills?: number[];
  disabled?: boolean;
}) {
  const setPct = (pct: number) => {
    if (balance == null || balance <= 0n) return;
    const v = (balance * BigInt(pct)) / 100n;
    onChange(ethers.formatEther(v));
  };

  const parsed = parseAmount(value);
  const over = parsed != null && balance != null && parsed > balance;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xms font-semibold uppercase tracking-[0.06em] text-fg-2">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {balance != null && (
            <span className="nums text-xms text-fg-3">Bal {fmtToken(balance)}</span>
          )}
          <div className="flex gap-1">
            {fills.map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled || balance == null || balance <= 0n}
                onClick={() => setPct(p)}
                className="rounded-sm border border-line px-2 py-[3px] text-[11px] font-semibold text-fg-3 transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg-3"
              >
                {p === 100 ? "MAX" : `${p}%`}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0.0"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "nums w-full rounded-md border bg-bg px-4 py-3 pr-20 text-sm text-fg outline-none transition-colors placeholder:text-fg-3",
            over ? "border-error" : "border-line focus:border-accent",
            disabled && "opacity-50"
          )}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-fg-3">
          {suffix}
        </span>
      </div>
      {over && <p className="mt-1 text-xms text-error">Amount exceeds your balance.</p>}
    </div>
  );
}
