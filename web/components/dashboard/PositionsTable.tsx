"use client";

import { DashPanel, DashPanelHeader, DashPanelBody, SectionTitle } from "@/components/dashboard/DashPanel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConnectButton } from "@/components/dashboard/ConnectButton";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { LiveNumber } from "@/components/ui/LiveNumber";
import { useTx } from "@/components/providers/TxProvider";
import { useEthers } from "@/lib/web3";
import { useAccountData, useProtocolStats } from "@/lib/useProtocolData";
import { fmtToken, formatDuration, perSecondAccrual, weiToNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

function Stat({
  label,
  value,
  unit,
  accent,
  loading,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  loading?: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-line bg-bg p-4">
      <p className="text-xms uppercase tracking-[0.06em] text-fg-3">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1">
        {loading ? (
          <span className="inline-block h-5 w-20 animate-pulse rounded bg-surface-2" />
        ) : (
          <span className={cn("nums text-base font-bold", accent ? "text-accent" : "text-fg")}>{value}</span>
        )}
        {unit && !loading && <span className="text-xms text-fg-3">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xms leading-snug text-fg-3">{hint}</p>}
    </div>
  );
}

/** A staking position card: staked principal + claimable rewards + Claim. */
function FarmCard({
  title,
  stakedLabel,
  staked,
  stakeUnit,
  earned,
  accrualPerSec,
  loading,
  onClaim,
  busy,
}: {
  title: string;
  stakedLabel: string;
  staked: bigint | undefined;
  stakeUnit: string;
  earned: bigint | undefined;
  accrualPerSec: number;
  loading: boolean;
  onClaim: () => void;
  busy: boolean;
}) {
  const hasEarned = (earned ?? 0n) > 0n;
  return (
    <div className="rounded-md border border-line bg-bg p-4">
      <p className="text-xs font-semibold text-fg">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xms uppercase tracking-[0.06em] text-fg-3">{stakedLabel}</p>
          <p className="nums mt-0.5 text-sm font-bold text-fg">
            {loading ? "…" : fmtToken(staked ?? 0n)} <span className="text-xms font-normal text-fg-3">{stakeUnit}</span>
          </p>
        </div>
        <div>
          <p className="text-xms uppercase tracking-[0.06em] text-fg-3">Claimable VRT</p>
          <p className="nums mt-0.5 text-sm font-bold text-accent">
            {loading ? (
              "…"
            ) : (
              <LiveNumber value={weiToNumber(earned ?? 0n)} precision={6} accrualPerSec={accrualPerSec} />
            )}
          </p>
        </div>
      </div>
      <button
        onClick={onClaim}
        disabled={busy || !hasEarned}
        className="mt-3 w-full rounded-md border border-line py-2 text-xms font-semibold text-fg-2 transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
      >
        Claim VRT
      </button>
    </div>
  );
}

export function PositionsTable() {
  const { authenticated, address } = useEthers();
  const { data, loading } = useAccountData(address);
  const { data: proto } = useProtocolStats();
  const { runTx, busy } = useTx();

  const ltcRate =
    data && proto ? perSecondAccrual(data.ltcStaked, proto.ltcTvl, proto.ltcRewardPerDay) : 0;
  const vrtRate =
    data && proto ? perSecondAccrual(data.vrtStaked, proto.vrtStaked, proto.vrtRewardPerDay) : 0;

  const claimLtc = () => runTx({ label: "Claim VRT (LTC farm)", send: ({ c }) => c.ltcFarm.claim() });
  const claimVrt = () => runTx({ label: "Claim VRT (VRT farm)", send: ({ c }) => c.vrtFarm.claim() });

  const totalClaimable = (data?.ltcEarned ?? 0n) + (data?.vrtEarned ?? 0n);

  return (
    <DashPanel>
      <DashPanelHeader>
        <SectionTitle
          icon="vault"
          title="Your position"
          action={
            totalClaimable > 0n ? <Badge tone="accent">{fmtToken(totalClaimable)} VRT claimable</Badge> : undefined
          }
        />
      </DashPanelHeader>

      <DashPanelBody className="flex flex-col gap-4">
        {!authenticated || !address ? (
          <EmptyState
            icon="wallet"
            title="Connect to see your position"
            description="Your balances, staked amounts, and claimable VRT are read live from the LitVM testnet once connected."
            action={<ConnectButton />}
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="zkLTC (gas)" value={fmtToken(data?.nativeBalance ?? null)} loading={loading && !data} />
              <Stat label="WzkLTC" value={fmtToken(data?.wzkltc ?? null)} loading={loading && !data} />
              <Stat label="VRT" value={fmtToken(data?.vrt ?? null)} loading={loading && !data} />
            </div>

            <FarmCard
              title="LTC Yield Farm — stake WzkLTC, earn VRT"
              stakedLabel="Staked"
              staked={data?.ltcStaked}
              stakeUnit="WzkLTC"
              earned={data?.ltcEarned}
              accrualPerSec={ltcRate}
              loading={loading && !data}
              onClaim={claimLtc}
              busy={busy}
            />

            <FarmCard
              title="VRT Staking — stake VRT, earn VRT"
              stakedLabel="Staked"
              staked={data?.vrtStaked}
              stakeUnit="VRT"
              earned={data?.vrtEarned}
              accrualPerSec={vrtRate}
              loading={loading && !data}
              onClaim={claimVrt}
              busy={busy}
            />

            <div className="flex items-center justify-between rounded-md border border-line bg-bg px-4 py-3">
              <span className="flex items-center gap-2 text-xs text-fg-2">
                <Icon name="claim" size={15} className="text-fg-3" /> Faucet
              </span>
              <span className="nums text-xs font-semibold text-fg">
                {data ? (data.faucetCooldownSec === 0 ? "10 VRT ready" : `in ${formatDuration(data.faucetCooldownSec)}`) : "—"}
              </span>
            </div>
          </>
        )}
      </DashPanelBody>
    </DashPanel>
  );
}
