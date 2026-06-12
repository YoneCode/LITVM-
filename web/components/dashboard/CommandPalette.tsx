"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTx } from "@/components/providers/TxProvider";
import { EASE_QUART } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Cmd = {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  group: "Go to" | "Actions" | "Wallet";
  run: () => void;
};

/** subsequence fuzzy match: every query char appears in order in the target */
function fuzzy(query: string, target: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let i = 0;
  for (let j = 0; j < t.length && i < q.length; j++) {
    if (t[j] === q[i]) i++;
  }
  return i === q.length;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { authenticated, login, logout } = usePrivy();
  const { runTx } = useTx();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Cmd[]>(() => {
    const go = (id: string): (() => void) => () => {
      onClose();
      // let the dialog close before scrolling
      requestAnimationFrame(() => scrollToSection(id));
    };
    const act = (fn: () => void): (() => void) => () => {
      onClose();
      fn();
    };

    const nav: Cmd[] = [
      { id: "overview", label: "Overview", hint: "Protocol metrics", icon: "overview", group: "Go to", run: go("overview") },
      { id: "position", label: "Position & manage", hint: "Wrap · stake · claim", icon: "vault", group: "Go to", run: go("position") },
      { id: "activity", label: "Activity", hint: "Your on-chain events", icon: "activity", group: "Go to", run: go("activity") },
      { id: "governance", label: "Governance", hint: "Owner · params", icon: "shield", group: "Go to", run: go("governance") },
      { id: "health", label: "Health & risk", hint: "Runway · status", icon: "gauge", group: "Go to", run: go("health") },
    ];

    const actions: Cmd[] = [
      { id: "claim-ltc", label: "Claim VRT — LTC farm", hint: "Harvest WzkLTC rewards", icon: "claim", group: "Actions", run: act(() => runTx({ label: "Claim VRT (LTC farm)", send: ({ c }) => c.ltcFarm.claim() })) },
      { id: "claim-vrt", label: "Claim VRT — VRT farm", hint: "Harvest VRT rewards", icon: "claim", group: "Actions", run: act(() => runTx({ label: "Claim VRT (VRT farm)", send: ({ c }) => c.vrtFarm.claim() })) },
      { id: "faucet", label: "Claim 10 VRT from faucet", hint: "Once per 24h", icon: "claim", group: "Actions", run: act(() => runTx({ label: "Claim faucet", send: ({ c }) => c.faucet.claim() })) },
      { id: "wrap", label: "Wrap / stake", hint: "Open the Manage panel", icon: "deposit", group: "Actions", run: go("position") },
    ];

    const wallet: Cmd[] = authenticated
      ? [{ id: "disconnect", label: "Disconnect wallet", hint: "Sign out", icon: "close", group: "Wallet", run: act(() => logout()) }]
      : [{ id: "connect", label: "Connect wallet", hint: "Sign in with Privy", icon: "wallet", group: "Wallet", run: act(() => login()) }];

    return [...nav, ...actions, ...wallet];
  }, [authenticated, login, logout, runTx, onClose]);

  const filtered = useMemo(
    () => commands.filter((c) => fuzzy(query, `${c.label} ${c.hint}`)),
    [commands, query]
  );

  // reset state when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[active]?.run();
      }
    },
    [filtered, active, onClose]
  );

  // keep the active row in view
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: EASE_QUART }}
          onMouseDown={onClose}
        >
          <div aria-hidden className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_QUART }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-[0_40px_120px_-24px_rgba(0,0,0,0.8)]"
          >
            {/* input */}
            <div className="flex items-center gap-2.5 border-b border-line px-4">
              <Icon name="search" size={16} className="text-fg-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section or run an action…"
                aria-label="Command palette search"
                className="w-full bg-transparent py-3.5 text-sm text-fg outline-none placeholder:text-fg-3"
              />
              <kbd className="rounded-sm border border-line bg-bg px-1.5 py-0.5 text-[10px] font-medium text-fg-3">
                esc
              </kbd>
            </div>

            {/* results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-fg-3">No matching commands.</p>
              ) : (
                filtered.map((c, i) => {
                  const showGroup = c.group !== lastGroup;
                  lastGroup = c.group;
                  return (
                    <div key={c.id}>
                      {showGroup && (
                        <p className="px-2.5 pb-1 pt-2 text-xms font-semibold uppercase tracking-[0.08em] text-fg-3">
                          {c.group}
                        </p>
                      )}
                      <button
                        data-idx={i}
                        onMouseEnter={() => setActive(i)}
                        onClick={c.run}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                          i === active ? "bg-surface-2" : "hover:bg-surface-2/60"
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded-sm",
                            i === active ? "bg-accent-muted text-accent" : "bg-bg text-fg-3"
                          )}
                        >
                          <Icon name={c.icon} size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-fg">{c.label}</span>
                          <span className="block truncate text-xms text-fg-3">{c.hint}</span>
                        </span>
                        {i === active && <Icon name="chevron" size={14} className="text-fg-3" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* footer hint */}
            <div className="flex items-center justify-between border-t border-line px-3 py-2 text-xms text-fg-3">
              <span className="flex items-center gap-1.5">
                <Icon name="command" size={12} /> command palette
              </span>
              <span className="nums">↑↓ navigate · ↵ run · esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
