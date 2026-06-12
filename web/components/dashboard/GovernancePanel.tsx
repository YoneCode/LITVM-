"use client";

import { DashPanel, DashPanelHeader, DashPanelBody, SectionTitle } from "@/components/dashboard/DashPanel";
import { Icon } from "@/components/ui/Icon";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { useTx } from "@/components/providers/TxProvider";
import { useGovernanceInfo } from "@/lib/useProtocolData";
import { useEthers } from "@/lib/web3";
import { explorerAddr, shortAddr, ADDRESSES } from "@/lib/chain";
import { fmtToken, formatDuration, formatNumber } from "@/lib/format";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs text-fg-2">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Skel() {
  return <span className="inline-block h-4 w-24 animate-pulse rounded bg-surface-2" />;
}

export function GovernancePanel() {
  const { data, loading } = useGovernanceInfo();
  const { address } = useEthers();
  const { runTx, busy } = useTx();

  const isOwner = !!data?.owner && !!address && data.owner.toLowerCase() === address.toLowerCase();

  const pauseFarm = () =>
    runTx({ label: data?.paused ? "Unpause farm" : "Pause farm", send: ({ c }) => (data?.paused ? c.ltcFarm.unpause() : c.ltcFarm.pause()) });

  return (
    <DashPanel className="h-full">
      <DashPanelHeader>
        <SectionTitle
          icon="shield"
          title="Governance & control"
          action={
            loading ? <Skel /> : <StatusBadge state={data?.paused ? "failed" : "live"} label={data?.paused ? "Paused" : "Operational"} />
          }
        />
      </DashPanelHeader>

      <DashPanelBody className="flex flex-col gap-4">
        <div className="divide-y divide-line rounded-md border border-line bg-bg px-4">
          <Row label="Farm owner">
            {loading ? (
              <Skel />
            ) : (
              <a
                href={explorerAddr(data!.owner)}
                target="_blank"
                rel="noopener noreferrer"
                className="nums inline-flex items-center gap-1 text-xs font-medium text-fg transition-colors hover:text-accent"
              >
                {shortAddr(data!.owner)} <Icon name="external" size={11} />
              </a>
            )}
          </Row>
          <Row label="LTC farm">
            <a
              href={explorerAddr(ADDRESSES.ltcFarm)}
              target="_blank"
              rel="noopener noreferrer"
              className="nums inline-flex items-center gap-1 text-xs font-medium text-fg transition-colors hover:text-accent"
            >
              {shortAddr(ADDRESSES.ltcFarm)} <Icon name="external" size={11} />
            </a>
          </Row>
          <Row label="VRT farm">
            <a
              href={explorerAddr(ADDRESSES.vrtFarm)}
              target="_blank"
              rel="noopener noreferrer"
              className="nums inline-flex items-center gap-1 text-xs font-medium text-fg transition-colors hover:text-accent"
            >
              {shortAddr(ADDRESSES.vrtFarm)} <Icon name="external" size={11} />
            </a>
          </Row>
          <Row label="Emission (LTC / VRT)">
            {loading ? (
              <Skel />
            ) : (
              <span className="nums text-xs font-medium text-fg">
                {formatNumber(data!.ltcRewardPerDay, 1)} / {formatNumber(data!.vrtRewardPerDay, 1)} VRT per day
              </span>
            )}
          </Row>
          <Row label="Faucet rate">
            {loading ? (
              <Skel />
            ) : (
              <span className="nums text-xs font-medium text-fg">
                {fmtToken(data!.faucetAmount)} VRT / {formatDuration(data!.faucetCooldownSec)}
              </span>
            )}
          </Row>
          <Row label="Safety (contract)">
            <a href={explorerAddr(ADDRESSES.ltcFarm)} target="_blank" rel="noopener noreferrer">
              <Badge tone="success">
                <Icon name="check" size={12} strokeWidth={2.2} /> ReentrancyGuard · Pausable
              </Badge>
            </a>
          </Row>
        </div>

        <div className="rounded-md border border-dashed border-line p-3">
          <div className="flex items-center gap-2">
            <Icon name="settings" size={14} className="text-fg-3" />
            <span className="text-xms font-semibold uppercase tracking-[0.06em] text-fg-3">Owner controls</span>
            {!isOwner && <Badge tone="muted" className="ml-auto">Read-only</Badge>}
            {isOwner && <Badge tone="accent" className="ml-auto">You are owner</Badge>}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <button
              disabled={!isOwner || busy}
              onClick={pauseFarm}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line py-2 text-xs font-medium text-fg-2 transition-colors hover:border-line-hover hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="pause" size={13} /> {data?.paused ? "Unpause" : "Pause"} LTC farm
            </button>
          </div>
          {!isOwner && (
            <p className="mt-2 text-xms text-fg-3">
              Owner-only <span className="nums">onlyOwner</span> action. Connect the owner account to enable it.
            </p>
          )}
        </div>
      </DashPanelBody>
    </DashPanel>
  );
}
