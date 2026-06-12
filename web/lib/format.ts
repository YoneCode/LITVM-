/** Shared number formatting for the command center. Tabular, locale-aware. */

export function formatNumber(value: number, precision = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

/** Compact: 50,412 → 50.4K, 1,284,000 → 1.28M */
export function formatCompact(value: number): string {
  return value.toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number, precision = 2): string {
  return `${value.toFixed(precision)}%`;
}

export function formatByKind(
  value: number,
  format: "number" | "compact" | "percent" = "number",
  precision = 0
): string {
  if (format === "compact") return formatCompact(value);
  if (format === "percent") return value.toFixed(precision);
  return formatNumber(value, precision);
}

/**
 * Format an 18-decimal token amount (bigint wei) for display.
 * Mirrors the tiered precision of the proven frontend/app.js `fm()`.
 */
export function fmtToken(wei: bigint | null | undefined): string {
  if (wei == null) return "—";
  if (wei === 0n) return "0";
  const n = parseFloat(weiToEtherString(wei));
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(6);
  if (n < 1000) return n.toFixed(4);
  if (n < 1_000_000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return (n / 1_000_000).toFixed(2) + "M";
}

/** number of ether units as a float (for math, not display). */
export function weiToNumber(wei: bigint): number {
  return parseFloat(weiToEtherString(wei));
}

function weiToEtherString(wei: bigint): string {
  const neg = wei < 0n;
  const v = neg ? -wei : wei;
  const s = v.toString().padStart(19, "0");
  const whole = s.slice(0, -18);
  const frac = s.slice(-18).replace(/0+$/, "");
  return (neg ? "-" : "") + (frac ? `${whole}.${frac}` : whole);
}

/** Seconds → "2d 6h 14m" / "3h 11m" / "Ready". */
export function formatDuration(totalSec: number): string {
  if (totalSec <= 0) return "Ready";
  const d = Math.floor(totalSec / 86_400);
  const h = Math.floor((totalSec % 86_400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Truthful per-second VRT accrual for a staker, in ether units.
 * rate = (rewardPerDay / 86400) × (userStake / totalStake).
 * This is the exact reward-per-share emission share the contract pays, so a
 * client-side tick between polls never overstates — each poll re-anchors to the
 * real on-chain `earned()`.
 */
export function perSecondAccrual(
  userStakedWei: bigint,
  totalStakedWei: bigint,
  rewardPerDay: number
): number {
  if (totalStakedWei === 0n || rewardPerDay <= 0) return 0;
  const share = weiToNumber(userStakedWei) / weiToNumber(totalStakedWei);
  return (rewardPerDay / 86_400) * share;
}
