"use client";

import { motion } from "framer-motion";
import { DashPanel, DashPanelHeader, DashPanelBody, SectionTitle } from "@/components/dashboard/DashPanel";
import { Icon } from "@/components/ui/Icon";
import { useProtocolStats } from "@/lib/useProtocolData";
import { fmtToken, weiToNumber } from "@/lib/format";
import { EASE_QUART } from "@/lib/motion";
import { cn } from "@/lib/cn";

type State = "healthy" | "watch" | "risk";

const meta: Record<State, { bar: string; text: string; icon: "check" | "alert"; label: string }> = {
  healthy: { bar: "bg-success", text: "text-success", icon: "check", label: "Healthy" },
  watch: { bar: "bg-warning", text: "text-warning", icon: "alert", label: "Watch" },
  risk: { bar: "bg-error", text: "text-error", icon: "alert", label: "At risk" },
};

function Signal({
  label,
  value,
  state,
  detail,
  level,
  index,
}: {
  label: string;
  value: string;
  state: State;
  detail: string;
  level?: number;
  index: number;
}) {
  const m = meta[state];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: EASE_QUART }}
      className="rounded-md border border-line bg-bg p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-fg-2">{label}</span>
        <span className={cn("inline-flex items-center gap-1 text-xms font-medium", m.text)}>
          <Icon name={m.icon} size={12} strokeWidth={2} />
          {m.label}
        </span>
      </div>
      <p className="nums mt-2 text-lg font-bold tracking-[-0.01em] text-fg">{value}</p>
      {level != null && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className={cn("h-full rounded-full", m.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(2, level))}%` }}
            transition={{ duration: 0.7, ease: EASE_QUART }}
          />
        </div>
      )}
      <p className="mt-2 text-xms leading-relaxed text-fg-3">{detail}</p>
    </motion.div>
  );
}

function runwayDays(availableWei: bigint, perDay: number): number {
  if (perDay <= 0) return Infinity;
  return weiToNumber(availableWei) / perDay;
}

function runwayState(days: number): State {
  if (days >= 30) return "healthy";
  if (days >= 7) return "watch";
  return "risk";
}

function runwayLabel(days: number): string {
  if (!isFinite(days)) return "∞";
  if (days >= 365) return "365+ days";
  return `${days.toFixed(0)} days`;
}

export function InsightsPanel() {
  const { data, loading } = useProtocolStats();

  if (loading || !data) {
    return (
      <DashPanel className="h-full">
        <DashPanelHeader>
          <SectionTitle icon="gauge" title="Health & risk" />
        </DashPanelHeader>
        <DashPanelBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-md bg-surface-2" />
            ))}
          </div>
        </DashPanelBody>
      </DashPanel>
    );
  }

  const ltcRunway = runwayDays(data.ltcRewardsAvailable, data.ltcRewardPerDay);
  const vrtRunway = runwayDays(data.vrtRewardsAvailable, data.vrtRewardPerDay);
  const faucetNum = weiToNumber(data.faucetPool);

  const ltcState = runwayState(ltcRunway);
  const vrtState = runwayState(vrtRunway);
  const faucetState: State = faucetNum > 1000 ? "healthy" : faucetNum > 100 ? "watch" : "risk";
  const pauseState: State = data.paused ? "risk" : "healthy";

  const attention = [ltcState, vrtState, faucetState, pauseState].filter((s) => s !== "healthy").length;

  return (
    <DashPanel className="h-full">
      <DashPanelHeader>
        <SectionTitle
          icon="gauge"
          title="Health & risk"
          action={
            <span className="text-xms text-fg-3">
              {attention === 0 ? "All signals nominal" : `${attention} need attention`}
            </span>
          }
        />
      </DashPanelHeader>
      <DashPanelBody>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Signal
            index={0}
            label="LTC vault reward runway"
            value={runwayLabel(ltcRunway)}
            state={ltcState}
            level={isFinite(ltcRunway) ? (ltcRunway / 365) * 100 : 100}
            detail="Days of VRT rewards remaining at the current emission rate."
          />
          <Signal
            index={1}
            label="VRT farm reward runway"
            value={runwayLabel(vrtRunway)}
            state={vrtState}
            level={isFinite(vrtRunway) ? (vrtRunway / 365) * 100 : 100}
            detail="Days of VRT rewards remaining for the VRT staking farm."
          />
          <Signal
            index={2}
            label="Faucet reserves"
            value={`${fmtToken(data.faucetPool)} VRT`}
            state={faucetState}
            detail="VRT remaining for new users to claim and start staking."
          />
          <Signal
            index={3}
            label="Farm status"
            value={data.paused ? "Paused" : "Operational"}
            state={pauseState}
            detail="Staking and rewards are active while the farm is not paused by the owner."
          />
        </div>
      </DashPanelBody>
    </DashPanel>
  );
}
