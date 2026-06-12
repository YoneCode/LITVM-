"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import { ConnectButton } from "@/components/dashboard/ConnectButton";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { Logo } from "@/components/ui/Logo";
import { EASE_QUART } from "@/lib/motion";
import { useChainStatus } from "@/lib/useProtocolData";
import { useEthers } from "@/lib/web3";
import { PRODUCT } from "@/lib/constants";
import { shortAddr } from "@/lib/chain";
import { cn } from "@/lib/cn";

type NavItem = { label: string; icon: IconName; id: string; active?: boolean };

const NAV: NavItem[] = [
  { label: "Overview", icon: "overview", id: "overview", active: true },
  { label: "Position", icon: "vault", id: "position" },
  { label: "Activity", icon: "activity", id: "activity" },
  { label: "Governance", icon: "shield", id: "governance" },
  { label: "Health", icon: "gauge", id: "health" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-2">
      <Logo size={32} className="rounded-sm" />
      <span className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold tracking-[0.02em] text-fg">{PRODUCT.name}</span>
        <span className="text-xms text-fg-3">Console</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Console">
      {NAV.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={onNavigate}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-fast ease-quart",
            item.active
              ? "bg-surface-2 font-medium text-fg"
              : "text-fg-2 hover:bg-surface-2/60 hover:text-fg"
          )}
        >
          <Icon
            name={item.icon}
            size={17}
            className={item.active ? "text-accent" : "text-fg-3 group-hover:text-fg-2"}
          />
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function AccountFooter() {
  const { authenticated, address } = useEthers();
  return (
    <div className="rounded-md border border-line bg-bg p-3">
      {authenticated && address ? (
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-7 w-7 shrink-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 140deg, var(--accent), color-mix(in oklab, var(--accent) 40%, var(--surface-2)), var(--accent))",
            }}
          />
          <div className="min-w-0">
            <p className="nums truncate text-xs font-semibold text-fg">{shortAddr(address)}</p>
            <p className="text-xms text-fg-3">Connected</p>
          </div>
        </div>
      ) : (
        <p className="text-xms text-fg-3">
          Connect a wallet to view your position and transact.
        </p>
      )}
    </div>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const { online } = useChainStatus();
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="pt-1">
        <Brand />
      </div>
      <div className="px-1">
        <NavList onNavigate={onNavigate} />
      </div>
      <div className="mt-auto flex flex-col gap-3 px-1">
        <StatusBadge
          state={online ? "live" : "failed"}
          label={online ? "LitVM 4441 · live" : "RPC unreachable"}
          className="w-full justify-start"
        />
        <AccountFooter />
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      } else if (e.key === "Escape") {
        setDrawer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-surface lg:block">
        <SidebarInner />
      </aside>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_QUART }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: EASE_QUART }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-surface lg:hidden"
            >
              <SidebarInner onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-col">
        <CommandBar onMenu={() => setDrawer(true)} onOpenCommand={() => setCmdOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

/* ---------------- Command Center Header ---------------- */

function StatusPill({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: IconName;
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className="hidden items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 md:flex">
      <Icon name={icon} size={14} className={tone === "accent" ? "text-accent" : "text-fg-3"} />
      <span className="text-xms text-fg-3">{label}</span>
      <span className="nums text-xms font-semibold text-fg">{value}</span>
    </div>
  );
}

function CommandBar({ onMenu, onOpenCommand }: { onMenu: () => void; onOpenCommand: () => void }) {
  const { blockNumber, gasGwei, latencyMs, online } = useChainStatus();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="rounded-md border border-line p-1.5 text-fg-2 transition-colors hover:text-fg lg:hidden"
          aria-label="Open navigation"
        >
          <Icon name="menu" size={18} />
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-fg">Overview</h1>
          <p className="hidden text-xms text-fg-3 sm:block">Vault command center</p>
        </div>

        {/* live, real chain status */}
        <div className="ml-4 flex items-center gap-2">
          <StatusPill
            icon="block"
            label="Block"
            value={blockNumber != null ? blockNumber.toLocaleString("en-US") : "—"}
          />
          <StatusPill icon="gas" label="Gas" value={gasGwei != null ? `${gasGwei} gwei` : "—"} />
          <StatusPill
            icon="activity"
            label="RPC"
            value={online && latencyMs != null ? `${latencyMs}ms` : "offline"}
            tone="accent"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onOpenCommand}
            className="hidden items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xms text-fg-3 transition-colors hover:border-line-hover hover:text-fg-2 sm:flex"
            aria-label="Open command palette"
          >
            <Icon name="search" size={14} />
            <span>Search</span>
            <kbd className="ml-1 flex items-center gap-0.5 rounded-sm border border-line bg-bg px-1 py-0.5 text-[10px] font-medium text-fg-3">
              <Icon name="command" size={10} /> K
            </kbd>
          </button>

          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
