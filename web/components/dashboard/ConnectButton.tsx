"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Icon } from "@/components/ui/Icon";
import { useEthers } from "@/lib/web3";
import { shortAddr } from "@/lib/chain";
import { cn } from "@/lib/cn";

/**
 * Single source for the connect / wrong-chain / connected states.
 * Real Privy auth — no mocked address anywhere.
 */
export function ConnectButton({ className }: { className?: string }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address, chainOk, ensureChain, hasWallet } = useEthers();

  if (!ready) {
    return (
      <span className={cn("inline-flex h-8 w-28 animate-pulse rounded-md bg-surface-2", className)} />
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-colors hover:bg-accent-hover active:scale-[0.98]",
          className
        )}
      >
        <Icon name="wallet" size={15} />
        Connect wallet
      </button>
    );
  }

  if (hasWallet && !chainOk) {
    return (
      <button
        onClick={ensureChain}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-[color-mix(in_oklab,var(--warning)_40%,transparent)] bg-warning-bg px-3 py-1.5 text-xs font-semibold text-warning transition-colors active:scale-[0.98]",
          className
        )}
      >
        <Icon name="alert" size={15} />
        Switch to LitVM
      </button>
    );
  }

  return (
    <button
      onClick={logout}
      title="Disconnect"
      className={cn(
        "group inline-flex items-center gap-2 rounded-md border border-line bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-line-hover",
        className
      )}
    >
      <span
        aria-hidden
        className="h-6 w-6 rounded-full"
        style={{
          background:
            "conic-gradient(from 140deg, var(--accent), color-mix(in oklab, var(--accent) 40%, var(--surface-2)), var(--accent))",
        }}
      />
      <span className="nums text-xms font-semibold text-fg">
        {address ? shortAddr(address) : "Connected"}
      </span>
      <Icon name="close" size={12} className="text-fg-3 group-hover:text-fg" />
    </button>
  );
}
