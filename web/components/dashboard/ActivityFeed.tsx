"use client";

import { motion } from "framer-motion";
import { DashPanel, DashPanelHeader, DashPanelBody, SectionTitle } from "@/components/dashboard/DashPanel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConnectButton } from "@/components/dashboard/ConnectButton";
import { Icon } from "@/components/ui/Icon";
import { useEthers } from "@/lib/web3";
import { useActivity, ACTIVITY_ICON, type ActivityItem } from "@/lib/useActivity";
import { explorerTx, shortAddr } from "@/lib/chain";
import { EASE_QUART } from "@/lib/motion";

function ago(ts: number | null): string {
  if (ts == null) return "";
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Row({ item, index, last }: { item: ActivityItem; index: number; last: boolean }) {
  const positive = item.amountLabel.startsWith("+");
  const negative = item.amountLabel.startsWith("-");
  const tone = positive ? "text-success" : negative ? "text-error" : "text-fg";
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: EASE_QUART }}
      className="relative flex gap-3.5"
    >
      <div className="flex flex-col items-center">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-bg text-fg-2">
          <Icon name={ACTIVITY_ICON[item.kind]} size={15} />
        </span>
        {!last && <span className="mt-1 w-px flex-1 bg-line" />}
      </div>

      <div className="flex flex-1 items-start justify-between gap-3 pb-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg">{item.title}</p>
          <a
            href={explorerTx(item.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-xms text-fg-3 transition-colors hover:text-accent"
          >
            <span className="nums">{shortAddr(item.txHash)}</span>
            <Icon name="external" size={11} />
          </a>
        </div>
        <div className="shrink-0 text-right">
          <p className={`nums text-xs font-semibold ${tone}`}>{item.amountLabel}</p>
          <p className="mt-0.5 nums text-xms text-fg-3">{ago(item.timestamp)}</p>
        </div>
      </div>
    </motion.li>
  );
}

export function ActivityFeed() {
  const { authenticated, address } = useEthers();
  const { items, loading, supported } = useActivity(address);

  return (
    <DashPanel className="h-full">
      <DashPanelHeader>
        <SectionTitle
          icon="activity"
          title="Your activity"
          count={items.length > 0 ? items.length : undefined}
        />
      </DashPanelHeader>
      <DashPanelBody>
        {!authenticated || !address ? (
          <EmptyState
            icon="activity"
            title="No wallet connected"
            description="Once connected, your deposits, withdrawals, stakes, and faucet claims are read directly from on-chain event logs."
            action={<ConnectButton />}
          />
        ) : loading && items.length === 0 ? (
          <ul className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex gap-3.5">
                <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-2" />
                <span className="h-8 flex-1 animate-pulse rounded bg-surface-2" />
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <EmptyState
            icon="activity"
            title={supported ? "No recent activity" : "History unavailable"}
            description={
              supported
                ? "No vault, staking, or faucet transactions for this address in the recent block window. New actions will appear here."
                : "This RPC limits historical log queries. Your live balances are still accurate above; transaction history needs an indexer."
            }
          />
        ) : (
          <ul className="flex flex-col">
            {items.map((it, i) => (
              <Row key={it.id} item={it} index={i} last={i === items.length - 1} />
            ))}
          </ul>
        )}
      </DashPanelBody>
    </DashPanel>
  );
}
