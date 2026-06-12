"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CHAIN_ID } from "@/lib/chain";

/**
 * Bridges Privy's wallet to an ethers v6 BrowserProvider + Signer.
 * Returns null signer until a wallet is connected on the LitVM chain.
 */
export function useEthers() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainOk, setChainOk] = useState(false);

  const wallet = wallets[0] ?? null;

  useEffect(() => {
    let cancelled = false;
    async function bridge() {
      if (!ready || !authenticated || !wallet) {
        setSigner(null);
        setAddress(null);
        setChainOk(false);
        return;
      }
      try {
        const eip1193 = await wallet.getEthereumProvider();
        const provider = new ethers.BrowserProvider(eip1193, "any");
        const s = await provider.getSigner();
        const addr = await s.getAddress();
        const net = await provider.getNetwork();
        if (cancelled) return;
        setSigner(s);
        setAddress(addr);
        setChainOk(Number(net.chainId) === CHAIN_ID);
      } catch {
        if (!cancelled) {
          setSigner(null);
          setAddress(null);
          setChainOk(false);
        }
      }
    }
    bridge();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, wallet, wallet?.address]);

  const ensureChain = useCallback(async () => {
    if (!wallet) return false;
    try {
      await wallet.switchChain(CHAIN_ID);
      setChainOk(true);
      return true;
    } catch {
      return false;
    }
  }, [wallet]);

  return {
    ready,
    authenticated,
    signer,
    address,
    chainOk,
    ensureChain,
    hasWallet: Boolean(wallet),
  };
}

/** Convenience: the connected address (lowercased) or null. */
export function useAddress(): string | null {
  const { address } = useEthers();
  return address;
}
