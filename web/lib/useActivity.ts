"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { readContracts, readProvider } from "@/lib/contracts";
import { useRefreshSignal } from "@/lib/refresh";
import type { IconName } from "@/components/ui/Icon";

/**
 * Real on-chain activity for the connected address, read via event logs.
 * There is no indexer, and public RPCs cap getLogs ranges, so we scan a
 * bounded recent window and fail gracefully per source. We never invent events.
 */

const LOOKBACK_BLOCKS = 200_000; // ~ several days at ~2s blocks
const MAX_ITEMS = 12;

export type ActivityKind = "stake" | "withdraw" | "reward" | "faucet";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  amountLabel: string;
  txHash: string;
  blockNumber: number;
  timestamp: number | null;
};

export const ACTIVITY_ICON: Record<ActivityKind, IconName> = {
  stake: "deposit",
  withdraw: "withdraw",
  reward: "claim",
  faucet: "claim",
};

type Raw = Omit<ActivityItem, "timestamp">;

export function useActivity(address: string | null) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const load = useCallback(async () => {
    if (!address) {
      setItems([]);
      return;
    }
    setLoading(true);
    const c = readContracts();
    const provider = readProvider();
    try {
      const latest = await provider.getBlockNumber();
      const from = Math.max(0, latest - LOOKBACK_BLOCKS);

      // Each source is queried independently; a single failure won't blank the feed.
      const sources: Array<Promise<Raw[]>> = [
        safeQuery(c.ltcVault, c.ltcVault.filters.Deposit(null, address), from, latest, (log) => ({
          id: logId(log),
          kind: "stake",
          title: "Deposited WzkLTC",
          amountLabel: `+${fmt(log.args?.assets)} WzkLTC`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        safeQuery(c.ltcVault, c.ltcVault.filters.Withdraw(null, null, address), from, latest, (log) => ({
          id: logId(log),
          kind: "withdraw",
          title: "Withdrew WzkLTC",
          amountLabel: `-${fmt(log.args?.assets)} WzkLTC`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        safeQuery(c.ltcVault, c.ltcVault.filters.RewardPaid(address), from, latest, (log) => ({
          id: logId(log),
          kind: "reward",
          title: "Claimed VRT (LTC vault)",
          amountLabel: `+${fmt(log.args?.amount)} VRT`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        safeQuery(c.vrtFarm, c.vrtFarm.filters.Staked(address), from, latest, (log) => ({
          id: logId(log),
          kind: "stake",
          title: "Staked VRT",
          amountLabel: `+${fmt(log.args?.amount)} VRT`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        safeQuery(c.vrtFarm, c.vrtFarm.filters.Withdrawn(address), from, latest, (log) => ({
          id: logId(log),
          kind: "withdraw",
          title: "Withdrew VRT",
          amountLabel: `-${fmt(log.args?.amount)} VRT`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        safeQuery(c.vrtFarm, c.vrtFarm.filters.RewardPaid(address), from, latest, (log) => ({
          id: logId(log),
          kind: "reward",
          title: "Claimed VRT (VRT farm)",
          amountLabel: `+${fmt(log.args?.amount)} VRT`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        safeQuery(c.faucet, c.faucet.filters.Claimed(address), from, latest, (log) => ({
          id: logId(log),
          kind: "faucet",
          title: "Claimed from faucet",
          amountLabel: `+${fmt(log.args?.amount)} VRT`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
      ];

      const settled = await Promise.allSettled(sources);
      const failures = settled.filter((s) => s.status === "rejected").length;
      setSupported(failures < sources.length); // all failed → RPC likely rejects getLogs

      const merged = settled
        .flatMap((s) => (s.status === "fulfilled" ? s.value : []))
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, MAX_ITEMS);

      // resolve timestamps for the unique blocks shown
      const uniqueBlocks = [...new Set(merged.map((m) => m.blockNumber))];
      const blockTimes = new Map<number, number>();
      await Promise.all(
        uniqueBlocks.map(async (bn) => {
          try {
            const b = await provider.getBlock(bn);
            if (b) blockTimes.set(bn, Number(b.timestamp));
          } catch {
            /* leave undefined */
          }
        })
      );

      setItems(
        merged.map((m) => ({ ...m, timestamp: blockTimes.get(m.blockNumber) ?? null }))
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read activity");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    let active = true;
    if (active) load();
    const id = setInterval(() => active && load(), 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load]);

  useRefreshSignal(load);

  return { items, loading, error, supported, refresh: load };
}

async function safeQuery(
  contract: ethers.Contract,
  filter: ethers.DeferredTopicFilter | ethers.ContractEventName,
  from: number,
  to: number,
  map: (log: ethers.EventLog) => Raw
): Promise<Raw[]> {
  const logs = await contract.queryFilter(filter, from, to);
  return logs
    .filter((l): l is ethers.EventLog => "args" in l)
    .map(map);
}

function logId(log: ethers.EventLog): string {
  return `${log.transactionHash}-${log.index}`;
}

function fmt(v: bigint | undefined): string {
  if (v == null) return "0";
  const n = parseFloat(ethers.formatEther(v));
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1000) return n.toFixed(4);
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
