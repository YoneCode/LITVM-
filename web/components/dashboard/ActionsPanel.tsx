"use client";

import { useState } from "react";
import { DashPanel, DashPanelHeader, DashPanelBody, SectionTitle } from "@/components/dashboard/DashPanel";
import { AmountInput, parseAmount } from "@/components/dashboard/AmountInput";
import { ConnectButton } from "@/components/dashboard/ConnectButton";
import { Icon } from "@/components/ui/Icon";
import { LiveNumber } from "@/components/ui/LiveNumber";
import { useTx } from "@/components/providers/TxProvider";
import { useEthers } from "@/lib/web3";
import { useAccountData, useProtocolStats } from "@/lib/useProtocolData";
import { ADDRESSES } from "@/lib/chain";
import { fmtToken, formatDuration, perSecondAccrual, weiToNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

type Tab = "wrap" | "earn" | "stake" | "faucet";

const TABS: { id: Tab; label: string; icon: Parameters<typeof Icon>[0]["name"] }[] = [
  { id: "wrap", label: "Wrap", icon: "deposit" },
  { id: "earn", label: "Earn", icon: "vault" },
  { id: "stake", label: "Stake VRT", icon: "stake" },
  { id: "faucet", label: "Faucet", icon: "claim" },
];

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-md py-2.5 text-sm font-semibold transition-colors active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary"
          ? "bg-accent text-bg hover:bg-accent-hover"
          : "border border-line bg-transparent text-fg-2 hover:border-line-hover hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}

/** Claimable-reward strip with a live per-second tick and a Claim button. */
function EarnedRow({
  earned,
  accrualPerSec,
  onClaim,
  disabled,
}: {
  earned: bigint | undefined;
  accrualPerSec: number;
  onClaim: () => void;
  disabled: boolean;
}) {
  const has = (earned ?? 0n) > 0n;
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-accent-subtle px-4 py-3">
      <div>
        <p className="text-xms uppercase tracking-[0.06em] text-fg-3">Claimable VRT</p>
        <p className="nums mt-0.5 text-base font-bold text-accent">
          <LiveNumber value={weiToNumber(earned ?? 0n)} precision={6} accrualPerSec={accrualPerSec} />
        </p>
      </div>
      <button
        onClick={onClaim}
        disabled={disabled || !has}
        className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-bg transition-colors hover:bg-accent-hover disabled:opacity-40"
      >
        Claim VRT
      </button>
    </div>
  );
}

export function ActionsPanel() {
  const { authenticated, address } = useEthers();
  const { data } = useAccountData(address);
  const { data: proto } = useProtocolStats();
  const { runTx, busy } = useTx();
  const [tab, setTab] = useState<Tab>("earn");

  // Truthful per-second accrual (re-anchored to on-chain `earned` every poll).
  const ltcRate =
    data && proto ? perSecondAccrual(data.ltcStaked, proto.ltcTvl, proto.ltcRewardPerDay) : 0;
  const vrtRate =
    data && proto ? perSecondAccrual(data.vrtStaked, proto.vrtStaked, proto.vrtRewardPerDay) : 0;

  const [wrapAmt, setWrapAmt] = useState("");
  const [unwrapAmt, setUnwrapAmt] = useState("");
  const [stakeLtc, setStakeLtc] = useState("");
  const [unstakeLtc, setUnstakeLtc] = useState("");
  const [stakeVrt, setStakeVrt] = useState("");
  const [unstakeVrt, setUnstakeVrt] = useState("");

  /* --- wrap --- */
  const doWrap = async () => {
    const amt = parseAmount(wrapAmt);
    if (!amt) return;
    if (await runTx({ label: "Wrap zkLTC", send: ({ c }) => c.wzkltc.deposit({ value: amt }) })) setWrapAmt("");
  };
  const doUnwrap = async () => {
    const amt = parseAmount(unwrapAmt);
    if (!amt) return;
    if (await runTx({ label: "Unwrap WzkLTC", send: ({ c }) => c.wzkltc.withdraw(amt) })) setUnwrapAmt("");
  };

  /* --- LTC farm: stake WzkLTC, earn VRT --- */
  const doStakeLtc = async () => {
    const amt = parseAmount(stakeLtc);
    if (!amt) return;
    const ok = await runTx({
      label: "Stake WzkLTC",
      approval: { token: (c) => c.wzkltc, spender: ADDRESSES.ltcFarm, amount: amt, symbol: "WzkLTC" },
      send: ({ c }) => c.ltcFarm.stake(amt),
    });
    if (ok) setStakeLtc("");
  };
  const doUnstakeLtc = async () => {
    const amt = parseAmount(unstakeLtc);
    if (!amt) return;
    if (await runTx({ label: "Withdraw WzkLTC", send: ({ c }) => c.ltcFarm.withdraw(amt) })) setUnstakeLtc("");
  };
  const claimLtc = () => runTx({ label: "Claim VRT (LTC farm)", send: ({ c }) => c.ltcFarm.claim() });

  /* --- VRT farm: stake VRT, earn VRT --- */
  const doStakeVrt = async () => {
    const amt = parseAmount(stakeVrt);
    if (!amt) return;
    const ok = await runTx({
      label: "Stake VRT",
      approval: { token: (c) => c.vrt, spender: ADDRESSES.vrtFarm, amount: amt, symbol: "VRT" },
      send: ({ c }) => c.vrtFarm.stake(amt),
    });
    if (ok) setStakeVrt("");
  };
  const doUnstakeVrt = async () => {
    const amt = parseAmount(unstakeVrt);
    if (!amt) return;
    if (await runTx({ label: "Withdraw VRT", send: ({ c }) => c.vrtFarm.withdraw(amt) })) setUnstakeVrt("");
  };
  const claimVrt = () => runTx({ label: "Claim VRT (VRT farm)", send: ({ c }) => c.vrtFarm.claim() });

  /* --- faucet --- */
  const doClaimFaucet = () => runTx({ label: "Claim faucet", send: ({ c }) => c.faucet.claim() });
  const faucetReady = data ? data.faucetCooldownSec === 0 : false;

  return (
    <DashPanel>
      <DashPanelHeader>
        <SectionTitle icon="wallet" title="Manage" />
      </DashPanelHeader>

      <div className="flex gap-1 border-b border-line px-3 pt-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-t-md px-3 py-2 text-xs font-medium transition-colors",
              tab === t.id
                ? "border-b-2 border-accent text-fg"
                : "border-b-2 border-transparent text-fg-3 hover:text-fg-2"
            )}
          >
            <Icon name={t.icon} size={14} className={tab === t.id ? "text-accent" : ""} />
            {t.label}
          </button>
        ))}
      </div>

      <DashPanelBody className="flex flex-col gap-5">
        {!authenticated && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-line px-3 py-2.5">
            <span className="text-xms text-fg-3">Connect a wallet to transact on LitVM.</span>
            <ConnectButton />
          </div>
        )}

        {tab === "wrap" && (
          <>
            <div className="flex flex-col gap-3">
              <AmountInput label="Wrap zkLTC → WzkLTC" value={wrapAmt} onChange={setWrapAmt} suffix="zkLTC" balance={data?.nativeBalance} />
              <ActionButton onClick={doWrap} disabled={busy || !parseAmount(wrapAmt)}>Wrap</ActionButton>
            </div>
            <hr className="border-line" />
            <div className="flex flex-col gap-3">
              <AmountInput label="Unwrap WzkLTC → zkLTC" value={unwrapAmt} onChange={setUnwrapAmt} suffix="WzkLTC" balance={data?.wzkltc} fills={[50, 100]} />
              <ActionButton variant="secondary" onClick={doUnwrap} disabled={busy || !parseAmount(unwrapAmt)}>Unwrap</ActionButton>
            </div>
          </>
        )}

        {tab === "earn" && (
          <>
            <EarnedRow earned={data?.ltcEarned} accrualPerSec={ltcRate} onClaim={claimLtc} disabled={busy} />
            <div className="flex flex-col gap-3">
              <AmountInput label="Stake WzkLTC" value={stakeLtc} onChange={setStakeLtc} suffix="WzkLTC" balance={data?.wzkltc} />
              <ActionButton onClick={doStakeLtc} disabled={busy || !parseAmount(stakeLtc)}>Approve &amp; Stake</ActionButton>
            </div>
            <hr className="border-line" />
            <div className="flex flex-col gap-3">
              <AmountInput label="Withdraw WzkLTC" value={unstakeLtc} onChange={setUnstakeLtc} suffix="WzkLTC" balance={data?.ltcStaked} fills={[50, 100]} />
              <ActionButton variant="secondary" onClick={doUnstakeLtc} disabled={busy || !parseAmount(unstakeLtc)}>Withdraw</ActionButton>
            </div>
            <p className="text-xms leading-relaxed text-fg-3">
              Staked WzkLTC earns VRT every second, claimable any time. Withdraw your WzkLTC whenever you want; withdrawing also pays out your pending VRT.
            </p>
          </>
        )}

        {tab === "stake" && (
          <>
            <EarnedRow earned={data?.vrtEarned} accrualPerSec={vrtRate} onClaim={claimVrt} disabled={busy} />
            <div className="flex flex-col gap-3">
              <AmountInput label="Stake VRT" value={stakeVrt} onChange={setStakeVrt} suffix="VRT" balance={data?.vrt} />
              <ActionButton onClick={doStakeVrt} disabled={busy || !parseAmount(stakeVrt)}>Approve &amp; Stake</ActionButton>
            </div>
            <hr className="border-line" />
            <div className="flex flex-col gap-3">
              <AmountInput label="Withdraw VRT" value={unstakeVrt} onChange={setUnstakeVrt} suffix="VRT" balance={data?.vrtStaked} fills={[50, 100]} />
              <ActionButton variant="secondary" onClick={doUnstakeVrt} disabled={busy || !parseAmount(unstakeVrt)}>Withdraw</ActionButton>
            </div>
            <p className="text-xms leading-relaxed text-fg-3">
              Stake VRT to earn additional VRT. No lock-up: withdraw any time, and withdrawing pays out your pending rewards.
            </p>
          </>
        )}

        {tab === "faucet" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-md border border-line bg-bg px-4 py-3">
              <div>
                <p className="text-xms uppercase tracking-[0.06em] text-fg-3">Your VRT</p>
                <p className="nums mt-0.5 text-base font-bold text-fg">{fmtToken(data?.vrt ?? null)}</p>
              </div>
              <div className="text-right">
                <p className="text-xms uppercase tracking-[0.06em] text-fg-3">Next claim</p>
                <p className="nums mt-0.5 text-sm font-semibold text-fg">
                  {data ? (faucetReady ? "Ready" : formatDuration(data.faucetCooldownSec)) : "—"}
                </p>
              </div>
            </div>
            <ActionButton onClick={doClaimFaucet} disabled={busy || (data != null && !faucetReady)}>
              {faucetReady || !data ? "Claim 10 VRT" : `Wait ${formatDuration(data.faucetCooldownSec)}`}
            </ActionButton>
            <p className="text-xms leading-relaxed text-fg-3">
              10 VRT per address every 24 hours. Use it to stake into the farms above. VRT is a testnet token with no monetary value.
            </p>
          </div>
        )}
      </DashPanelBody>
    </DashPanel>
  );
}
