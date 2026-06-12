"use client";

import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { readContracts, readProvider } from "@/lib/contracts";
import { useRefreshSignal } from "@/lib/refresh";
import { ADDRESSES } from "@/lib/chain";

const POLL_MS = 15_000;

type Async<T> = { data: T | null; loading: boolean; error: string | null; refresh: () => void };

/* ----------------------------- protocol stats ----------------------------- */

export type ProtocolStats = {
  ltcTvl: bigint; // WzkLTC staked in the LTC farm
  vrtStaked: bigint; // VRT staked in the VRT farm
  ltcRewardPerDay: number; // VRT/day emitted to LTC stakers (total)
  vrtRewardPerDay: number; // VRT/day emitted to VRT stakers (total)
  ltcEmissionPerToken: number | null; // VRT/day per WzkLTC staked
  ltcRewardsAvailable: bigint; // VRT left in the LTC farm to pay out
  vrtRewardsAvailable: bigint; // VRT left in the VRT farm to pay out
  faucetPool: bigint; // VRT held by the faucet
  paused: boolean; // LTC farm paused?
};

export function useProtocolStats(): Async<ProtocolStats> {
  const [data, setData] = useState<ProtocolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const c = readContracts();
    try {
      const [
        ltcTvl,
        vrtStaked,
        ltcRewardPerDayWei,
        vrtRewardPerDayWei,
        ltcRewardsAvailable,
        vrtRewardsAvailable,
        faucetPool,
        paused,
      ] = await Promise.all([
        c.ltcFarm.totalStaked() as Promise<bigint>,
        c.vrtFarm.totalStaked() as Promise<bigint>,
        c.ltcFarm.rewardPerDay() as Promise<bigint>,
        c.vrtFarm.rewardPerDay() as Promise<bigint>,
        c.ltcFarm.rewardsAvailable() as Promise<bigint>,
        c.vrtFarm.rewardsAvailable() as Promise<bigint>,
        c.vrt.balanceOf(ADDRESSES.faucet) as Promise<bigint>,
        c.ltcFarm.paused().catch(() => false) as Promise<boolean>,
      ]);

      const ltcRewardPerDay = Number(ethers.formatEther(ltcRewardPerDayWei));
      const vrtRewardPerDay = Number(ethers.formatEther(vrtRewardPerDayWei));
      const ltcTvlNum = Number(ethers.formatEther(ltcTvl));
      const ltcEmissionPerToken = ltcTvlNum > 0 ? ltcRewardPerDay / ltcTvlNum : null;

      setData({
        ltcTvl,
        vrtStaked,
        ltcRewardPerDay,
        vrtRewardPerDay,
        ltcEmissionPerToken,
        ltcRewardsAvailable,
        vrtRewardsAvailable,
        faucetPool,
        paused,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read protocol stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = () => active && load();
    run();
    const id = setInterval(run, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load]);

  const refresh = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  useRefreshSignal(load);

  return { data, loading, error, refresh };
}

/* ----------------------------- account data ----------------------------- */

export type AccountData = {
  nativeBalance: bigint; // zkLTC (gas)
  wzkltc: bigint; // wrapped, stakeable in LTC farm
  vrt: bigint; // VRT in wallet
  ltcStaked: bigint; // WzkLTC staked in LTC farm
  ltcEarned: bigint; // claimable VRT from LTC farm  ← real yield
  vrtStaked: bigint; // VRT staked in VRT farm
  vrtEarned: bigint; // claimable VRT from VRT farm
  faucetCooldownSec: number; // 0 = ready
};

export function useAccountData(address: string | null): Async<AccountData> {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(address));
  const [error, setError] = useState<string | null>(null);

  // adjust state during render when the account changes (no effect, no stale flash)
  const [trackedAddress, setTrackedAddress] = useState<string | null>(address);
  if (address !== trackedAddress) {
    setTrackedAddress(address);
    setData(null);
    setError(null);
    setLoading(Boolean(address));
  }

  const load = useCallback(async () => {
    if (!address) {
      setData(null);
      setLoading(false);
      return;
    }
    const c = readContracts();
    const provider = readProvider();
    try {
      const [
        nativeBalance,
        wzkltc,
        vrt,
        ltcStaked,
        ltcEarned,
        vrtStaked,
        vrtEarned,
        faucetCooldown,
      ] = await Promise.all([
        provider.getBalance(address),
        c.wzkltc.balanceOf(address) as Promise<bigint>,
        c.vrt.balanceOf(address) as Promise<bigint>,
        c.ltcFarm.balanceOf(address) as Promise<bigint>,
        c.ltcFarm.earned(address) as Promise<bigint>,
        c.vrtFarm.balanceOf(address) as Promise<bigint>,
        c.vrtFarm.earned(address) as Promise<bigint>,
        c.faucet.timeUntilClaim(address) as Promise<bigint>,
      ]);

      setData({
        nativeBalance,
        wzkltc,
        vrt,
        ltcStaked,
        ltcEarned,
        vrtStaked,
        vrtEarned,
        faucetCooldownSec: Number(faucetCooldown),
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read account data");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    let active = true;
    const run = () => active && load();
    run();
    const id = setInterval(run, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load, address]);

  const refresh = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  useRefreshSignal(load);

  return { data, loading, error, refresh };
}

/* ----------------------------- governance ----------------------------- */

export type GovernanceInfo = {
  owner: string;
  paused: boolean;
  ltcRewardPerDay: number;
  vrtRewardPerDay: number;
  faucetAmount: bigint;
  faucetCooldownSec: number;
};

export function useGovernanceInfo(): Async<GovernanceInfo> {
  const [data, setData] = useState<GovernanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const c = readContracts();
    try {
      const [owner, paused, ltcRpd, vrtRpd, faucetAmt, faucetCd] = await Promise.all([
        c.ltcFarm.owner().catch(() => "") as Promise<string>,
        c.ltcFarm.paused().catch(() => false) as Promise<boolean>,
        c.ltcFarm.rewardPerDay() as Promise<bigint>,
        c.vrtFarm.rewardPerDay() as Promise<bigint>,
        c.faucet.CLAIM_AMOUNT() as Promise<bigint>,
        c.faucet.COOLDOWN() as Promise<bigint>,
      ]);
      setData({
        owner,
        paused,
        ltcRewardPerDay: Number(ethers.formatEther(ltcRpd)),
        vrtRewardPerDay: Number(ethers.formatEther(vrtRpd)),
        faucetAmount: faucetAmt,
        faucetCooldownSec: Number(faucetCd),
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read governance info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = () => active && load();
    run();
    const id = setInterval(run, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load]);

  useRefreshSignal(load);

  return { data, loading, error, refresh: load };
}

/* ----------------------------- chain status ----------------------------- */

export type ChainStatus = {
  blockNumber: number | null;
  gasGwei: string | null;
  latencyMs: number | null;
  online: boolean;
};

export function useChainStatus(): ChainStatus {
  const [status, setStatus] = useState<ChainStatus>({
    blockNumber: null,
    gasGwei: null,
    latencyMs: null,
    online: false,
  });

  useEffect(() => {
    let active = true;
    const provider = readProvider();
    const load = async () => {
      const t0 = performance.now();
      try {
        const [block, fee] = await Promise.all([
          provider.getBlockNumber(),
          provider.getFeeData(),
        ]);
        const latencyMs = Math.round(performance.now() - t0);
        if (!active) return;
        const gas = fee.gasPrice ?? 0n;
        const gasGwei = (Number(gas) / 1e9).toFixed(3);
        setStatus({ blockNumber: block, gasGwei, latencyMs, online: true });
      } catch {
        if (active) setStatus((s) => ({ ...s, online: false }));
      }
    };
    load();
    const id = setInterval(load, 10_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return status;
}
