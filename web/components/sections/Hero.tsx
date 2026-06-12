"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DashboardPreview, type PreviewStats } from "@/components/ui/DashboardPreview";
import { NetBadge } from "@/components/ui/NetBadge";
import { LiveNumber } from "@/components/ui/LiveNumber";
import { Icon } from "@/components/ui/Icon";
import { EASE_QUART } from "@/lib/motion";
import { PRODUCT } from "@/lib/constants";
import { useProtocolStats, useChainStatus } from "@/lib/useProtocolData";
import { fmtToken, formatNumber, weiToNumber } from "@/lib/format";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_QUART } },
};

/** A single live metric in the hero bar — counts up from 0 when data arrives. */
function LiveStat({
  label,
  value,
  precision,
  suffix,
}: {
  label: string;
  value: number;
  precision: number;
  suffix: string;
}) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <span className="text-xms uppercase tracking-[0.08em] text-fg-3">{label}</span>
      <span className="nums mt-0.5 text-sm font-semibold text-fg">
        <LiveNumber value={value} precision={precision} />
        <span className="ml-1 text-xms font-normal text-fg-3">{suffix}</span>
      </span>
    </div>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Direction A — real, live on-chain reads (no wallet required).
  const { data: stats, loading, error } = useProtocolStats();
  const chain = useChainStatus();

  const previewStats: PreviewStats = {
    tvl: stats ? fmtToken(stats.ltcTvl) : "–",
    emissionPerDay: stats ? formatNumber(stats.ltcRewardPerDay, 1) : "–",
    vrtStaked: stats ? fmtToken(stats.vrtStaked) : "–",
    faucetPool: stats ? fmtToken(stats.faucetPool) : "–",
    block: chain.blockNumber != null ? chain.blockNumber.toLocaleString("en-US") : null,
    online: chain.online,
    loading: loading && !stats,
  };

  // Direction B — scroll-linked parallax on the teaser (transform/opacity only).
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -64]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.955]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.55]);

  return (
    <section ref={heroRef} id="top" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-lines opacity-[0.5]" />

      <div className="wrap relative pb-20 pt-16 sm:pt-24">
        <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
          <motion.div variants={item} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xms text-fg-2">
              <NetBadge />
              <span className="hidden sm:inline">Live on the LitVM testnet</span>
            </span>
          </motion.div>

          <motion.h1 variants={item} className="text-balance font-display text-3xl font-bold text-fg sm:text-4xl lg:text-5xl">
            Stake wrapped Litecoin. <span className="text-accent">Earn VRT.</span>
          </motion.h1>

          <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-balance text-base text-fg-2 sm:text-lg">
            Wrap zkLTC, stake it in a non-custodial farm on the LitVM testnet, and
            earn VRT every second, credited to your own address and claimable any
            time, with no lock-up. Withdraw your principal whenever you want.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={PRODUCT.appUrl} size="lg">
              Open the console
            </Button>
            <Button href="#narrative" variant="secondary" size="lg">
              How it works
            </Button>
          </motion.div>

          {/* Direction A — live protocol bar (real on-chain reads, counts up on load) */}
          <motion.div variants={item} className="mt-10 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-lg border border-line bg-surface/70 px-5 py-3 backdrop-blur-sm">
              <LiveStat
                label="Vault TVL"
                value={stats ? weiToNumber(stats.ltcTvl) : 0}
                precision={4}
                suffix="WzkLTC"
              />
              <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
              <LiveStat
                label="Emission"
                value={stats?.ltcRewardPerDay ?? 0}
                precision={1}
                suffix="VRT/day"
              />
              <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
              <LiveStat
                label="Faucet pool"
                value={stats ? weiToNumber(stats.faucetPool) : 0}
                precision={0}
                suffix="VRT"
              />
              <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xms uppercase tracking-[0.08em] text-fg-3">Block</span>
                <span className="nums mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-fg">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${chain.online ? "bg-success animate-pulse-dot" : "bg-fg-3"}`}
                  />
                  {chain.blockNumber != null ? chain.blockNumber.toLocaleString("en-US") : "–"}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.p variants={item} className="mt-4 text-xms text-fg-3">
            {error ? (
              <span className="inline-flex items-center gap-1.5 text-warning">
                <Icon name="alert" size={12} /> Reconnecting to the LitVM RPC…
              </span>
            ) : (
              "Real-time figures read straight from the deployed contracts · VRT is a testnet token with no monetary value"
            )}
          </motion.p>
        </motion.div>

        {/* product teaser — scroll-linked parallax (B), internal assembly (B), live strip (A) */}
        <motion.div style={{ y, scale, opacity }} className="relative mx-auto mt-16 max-w-5xl will-change-transform">
          <DashboardPreview stats={previewStats} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bg"
          />
        </motion.div>
      </div>
    </section>
  );
}
