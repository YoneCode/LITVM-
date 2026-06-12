"use client";

import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useProtocolStats } from "@/lib/useProtocolData";
import { fmtToken, formatNumber } from "@/lib/format";
import { EASE_QUART } from "@/lib/motion";
import { cn } from "@/lib/cn";

function Skeleton({ w = "w-24" }: { w?: string }) {
  return <span className={cn("inline-block h-5 animate-pulse rounded bg-surface-2", w)} />;
}

function Tile({
  icon,
  label,
  value,
  unit,
  sub,
  loading,
  index,
}: {
  icon: IconName;
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: string;
  loading: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: EASE_QUART }}
      className="flex flex-col justify-between rounded-md border border-line bg-surface p-4 transition-colors duration-fast ease-quart hover:border-line-hover"
    >
      <div className="flex items-center gap-2 text-fg-3">
        <Icon name={icon} size={15} />
        <span className="text-xms font-medium uppercase tracking-[0.07em]">{label}</span>
      </div>
      <div className="mt-3">
        <p className="flex items-baseline gap-1.5">
          <span className="nums text-xl font-bold tracking-[-0.01em] text-fg">{loading ? <Skeleton /> : value}</span>
          {unit && !loading && <span className="text-xs font-medium text-fg-3">{unit}</span>}
        </p>
        {sub && <p className="mt-1 text-xms text-fg-3">{loading ? <Skeleton w="w-32" /> : sub}</p>}
      </div>
    </motion.div>
  );
}

export function MetricsRow() {
  const { data, loading, error } = useProtocolStats();

  const emission =
    data?.ltcEmissionPerToken != null
      ? formatNumber(data.ltcEmissionPerToken, data.ltcEmissionPerToken < 1 ? 4 : 1)
      : "—";

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-[color-mix(in_oklab,var(--error)_30%,transparent)] bg-error-bg px-3 py-2 text-xs text-error">
          <Icon name="alert" size={14} /> Couldn&apos;t reach the LitVM RPC. Retrying…
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* hero — LTC farm TVL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_QUART }}
          className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-line bg-surface p-6 md:col-span-2"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
          <div className="relative flex items-center gap-2 text-fg-3">
            <Icon name="vault" size={16} />
            <span className="text-xms font-medium uppercase tracking-[0.07em]">LTC Yield Vault · TVL</span>
          </div>
          <div className="relative mt-4">
            <p className="flex items-baseline gap-2">
              <span className="nums text-3xl font-bold tracking-[-0.02em] text-fg sm:text-4xl">
                {loading ? <Skeleton w="w-40" /> : fmtToken(data!.ltcTvl)}
              </span>
              <span className="text-sm font-medium text-fg-3">WzkLTC staked</span>
            </p>
            <p className="mt-2 text-xms text-fg-3">
              {loading || !data
                ? "Reading on-chain…"
                : `${formatNumber(data.ltcRewardPerDay, 1)} VRT/day emitted to stakers · ${fmtToken(
                    data.ltcRewardsAvailable
                  )} VRT in rewards remaining`}
            </p>
          </div>
        </motion.div>

        <Tile
          icon="activity"
          label="Reward rate"
          value={emission}
          unit="VRT/day per WzkLTC"
          sub={data ? `${formatNumber(data.ltcRewardPerDay, 1)} VRT/day total` : undefined}
          loading={loading}
          index={1}
        />
        <Tile
          icon="stake"
          label="VRT staked"
          value={data ? fmtToken(data.vrtStaked) : "—"}
          unit="VRT"
          sub={data ? `earning ${formatNumber(data.vrtRewardPerDay, 1)} VRT/day` : undefined}
          loading={loading}
          index={2}
        />
        <Tile
          icon="claim"
          label="Faucet pool"
          value={data ? fmtToken(data.faucetPool) : "—"}
          unit="VRT"
          sub="10 VRT per address / 24h"
          loading={loading}
          index={3}
        />
      </div>
    </div>
  );
}
