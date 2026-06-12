"use client";

import { motion, type Variants } from "framer-motion";
import { EASE_QUART } from "@/lib/motion";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/** Live protocol stats fed from the hero's on-chain read (direction A). */
export type PreviewStats = {
  tvl: string; // WzkLTC staked
  emissionPerDay: string; // VRT/day total
  vrtStaked: string; // VRT staked
  faucetPool: string; // VRT in faucet
  block: string | null; // latest block height
  online: boolean;
  loading: boolean;
};

/* assembly choreography — staggered settle, reduced-motion safe via global MotionConfig */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const piece: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_QUART } },
};

/* ---------- shared sub-pieces ---------- */

function InfoRow({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-[5px] text-sm">
      <span className="text-fg-2">{k}</span>
      <span className={cn("nums font-medium", accent ? "font-semibold text-accent" : "text-fg")}>{v}</span>
    </div>
  );
}

function Field({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xms font-semibold uppercase tracking-[0.06em] text-fg-2">{label}</span>
        <div className="flex gap-1">
          {["25%", "50%", "MAX"].map((f) => (
            <span key={f} className="rounded-sm border border-line px-2.5 py-[3px] text-[11px] font-semibold text-fg-3">
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="nums w-full rounded-md border border-line bg-bg px-4 py-3 text-sm text-fg">{value}</div>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-fg-3">{suffix}</span>
      </div>
    </div>
  );
}

function Sep() {
  return <hr className="my-5 h-px border-0 bg-line" />;
}

function FakeButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <div
      className={cn(
        "w-full rounded-md py-3 text-center text-sm font-semibold",
        variant === "primary" ? "bg-accent text-bg" : "border border-line bg-transparent text-fg-2"
      )}
    >
      {children}
    </div>
  );
}

function StripStat({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xms text-fg-3">{label}</span>
      {loading ? (
        <span className="inline-block h-3 w-12 animate-pulse rounded bg-surface-2" />
      ) : (
        <span className="nums text-xs font-semibold text-fg">{value}</span>
      )}
    </div>
  );
}

/* ---------- the preview ---------- */

export function DashboardPreview({
  className,
  interactive = true,
  stats,
}: {
  className?: string;
  interactive?: boolean;
  stats?: PreviewStats;
}) {
  const live = stats?.online ?? false;
  const loading = stats?.loading ?? false;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-bg shadow-[0_40px_120px_-32px_rgba(0,0,0,0.7)]",
        className
      )}
      role="img"
      aria-label="LitVM Yield console preview with live protocol data"
    >
      {/* window chrome / header */}
      <motion.div variants={piece} className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Logo size={28} className="rounded-sm" />
          <span className="text-sm font-bold tracking-[0.02em] text-fg">LitVM Yield</span>
          <span className="text-xms text-fg-3">Console</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-sm px-2.5 py-1 text-xms font-medium sm:inline-flex",
              live ? "bg-success-bg text-success" : "bg-surface-2 text-fg-3"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-success animate-pulse-dot" : "bg-fg-3")} />
            {live && stats?.block ? `block ${stats.block}` : "connecting…"}
          </span>
          <span className="rounded-md bg-accent-muted px-3 py-1.5 text-xms font-semibold text-accent">LitVM 4441</span>
        </div>
      </motion.div>

      {/* LIVE protocol stats strip — real on-chain reads */}
      <motion.div variants={piece} className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-line px-5 py-3">
        <StripStat label="Vault TVL" value={`${stats?.tvl ?? "–"} WzkLTC`} loading={loading} />
        <StripStat label="Emission" value={`${stats?.emissionPerDay ?? "–"} VRT/day`} loading={loading} />
        <StripStat label="VRT staked" value={stats?.vrtStaked ?? "–"} loading={loading} />
        <StripStat label="Faucet" value={`${stats?.faucetPool ?? "–"} VRT`} loading={loading} />
        {live && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xms font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" /> live
          </span>
        )}
      </motion.div>

      {/* grid */}
      <div className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <motion.div
            variants={piece}
            whileHover={interactive ? { borderColor: "var(--border-hover)" } : undefined}
            transition={{ duration: 0.15, ease: EASE_QUART }}
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="mb-2 flex items-baseline justify-between">
              <h4 className="text-sm font-bold text-fg">LTC Yield Farm</h4>
              <span className="text-xms uppercase tracking-[0.06em] text-fg-3">Stake → earn</span>
            </div>
            <Field label="Stake WzkLTC" value="500.00" suffix="WzkLTC" />
            <FakeButton>Approve &amp; Stake</FakeButton>
            <Sep />
            <div className="grid grid-cols-2 gap-1 rounded-md bg-bg px-4 py-3">
              <div className="flex flex-col gap-0.5 py-2">
                <span className="text-xms text-fg-3">Staked</span>
                <span className="nums text-xs font-semibold text-fg">500.00 WzkLTC</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2">
                <span className="text-xms text-fg-3">Claimable VRT</span>
                <span className="nums text-xs font-semibold text-accent">12.4187</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2">
                <span className="text-xms text-fg-3">Emission</span>
                <span className="nums text-xs font-semibold text-fg">{stats?.emissionPerDay ?? "86.4"} VRT/day</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2">
                <span className="text-xms text-fg-3">Status</span>
                <span className="text-xs font-semibold text-success">Operational</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-4">
          <motion.div variants={piece} className="rounded-lg border border-line bg-surface p-5">
            <div className="mb-2 flex items-baseline justify-between">
              <h4 className="text-sm font-bold text-fg">VRT Faucet</h4>
              <span className="text-xms uppercase tracking-[0.06em] text-fg-3">Free</span>
            </div>
            <InfoRow k="Your VRT" v="42.0" />
            <InfoRow k="Next claim" v="Ready" />
            <div className="mt-3">
              <FakeButton>Claim 10 VRT</FakeButton>
            </div>
          </motion.div>

          <motion.div variants={piece} className="rounded-lg border border-line bg-surface p-5">
            <div className="mb-2 flex items-baseline justify-between">
              <h4 className="text-sm font-bold text-fg">VRT Staking</h4>
              <span className="text-xms uppercase tracking-[0.06em] text-fg-3">No lock</span>
            </div>
            <InfoRow k="Available VRT" v="42.0" />
            <InfoRow k="Staked" v="1,250.0" accent />
            <div className="mt-3">
              <FakeButton variant="secondary">Withdraw</FakeButton>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
