"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ethers } from "ethers";
import { AnimatePresence, motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { Icon } from "@/components/ui/Icon";
import { useEthers } from "@/lib/web3";
import { writeContracts, type WriteContracts } from "@/lib/contracts";
import { humanError } from "@/lib/tx";
import { triggerRefresh } from "@/lib/refresh";
import { explorerTx } from "@/lib/chain";
import { EASE_QUART } from "@/lib/motion";

type Phase = "approving" | "pending" | "confirming" | "success" | "error";

type Toast = {
  id: number;
  label: string;
  phase: Phase;
  message?: string;
  hash?: string;
};

type Helpers = { c: WriteContracts; address: string; signer: ethers.JsonRpcSigner };

type ApprovalSpec = {
  token: (c: WriteContracts) => ethers.Contract;
  spender: string;
  amount: bigint;
  symbol: string;
};

export type RunTxOptions = {
  label: string;
  /** optional ERC-20 approval to ensure before the main call */
  approval?: ApprovalSpec;
  send: (h: Helpers) => Promise<ethers.TransactionResponse>;
};

type TxContextValue = {
  /** returns true on confirmed success, false otherwise */
  runTx: (opts: RunTxOptions) => Promise<boolean>;
  busy: boolean;
};

const TxContext = createContext<TxContextValue | null>(null);

export function useTx(): TxContextValue {
  const ctx = useContext(TxContext);
  if (!ctx) throw new Error("useTx must be used within <TxProvider>");
  return ctx;
}

export function TxProvider({ children }: { children: React.ReactNode }) {
  const { signer, address, chainOk, ensureChain, authenticated } = useEthers();
  const { login } = usePrivy();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);

  const upsert = useCallback((t: Toast) => {
    setToasts((prev) => {
      const i = prev.findIndex((p) => p.id === t.id);
      if (i === -1) return [...prev, t];
      const copy = [...prev];
      copy[i] = t;
      return copy;
    });
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const autoDismiss = useCallback(
    (id: number, ms: number) => {
      window.setTimeout(() => dismiss(id), ms);
    },
    [dismiss]
  );

  const runTx = useCallback(
    async (opts: RunTxOptions): Promise<boolean> => {
      const id = nextId.current++;

      // 1. require a connected wallet
      if (!authenticated) {
        login();
        return false;
      }
      if (!signer || !address) {
        upsert({ id, label: opts.label, phase: "error", message: "Connect a wallet first." });
        autoDismiss(id, 6000);
        return false;
      }
      // 2. require correct chain
      if (!chainOk) {
        const ok = await ensureChain();
        if (!ok) {
          upsert({ id, label: opts.label, phase: "error", message: "Switch to the LitVM network to continue." });
          autoDismiss(id, 7000);
          return false;
        }
      }

      setBusy(true);
      const c = writeContracts(signer);
      const helpers: Helpers = { c, address, signer };

      try {
        // 3. approval step (only if current allowance is insufficient)
        if (opts.approval) {
          const token = opts.approval.token(c);
          const current: bigint = await token.allowance(address, opts.approval.spender);
          if (current < opts.approval.amount) {
            upsert({ id, label: opts.label, phase: "approving", message: `Approving ${opts.approval.symbol}…` });
            const ap = await token.approve(opts.approval.spender, opts.approval.amount);
            await ap.wait();
          }
        }

        // 4. main transaction
        upsert({ id, label: opts.label, phase: "pending", message: "Confirm in your wallet…" });
        const resp = await opts.send(helpers);
        upsert({ id, label: opts.label, phase: "confirming", message: "Waiting for confirmation…", hash: resp.hash });
        await resp.wait();

        upsert({ id, label: opts.label, phase: "success", message: "Confirmed on-chain.", hash: resp.hash });
        autoDismiss(id, 9000);
        triggerRefresh();
        return true;
      } catch (e) {
        upsert({ id, label: opts.label, phase: "error", message: humanError(e) });
        autoDismiss(id, 9000);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [authenticated, signer, address, chainOk, ensureChain, login, upsert, autoDismiss]
  );

  return (
    <TxContext.Provider value={{ runTx, busy }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </TxContext.Provider>
  );
}

/* ----------------------------- toaster UI ----------------------------- */

const phaseMeta: Record<
  Phase,
  { tone: string; icon: "check" | "alert" | "clock"; spin: boolean }
> = {
  approving: { tone: "text-warning", icon: "clock", spin: true },
  pending: { tone: "text-warning", icon: "clock", spin: true },
  confirming: { tone: "text-accent", icon: "clock", spin: true },
  success: { tone: "text-success", icon: "check", spin: false },
  error: { tone: "text-error", icon: "alert", spin: false },
};

function Toaster({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const m = phaseMeta[t.phase];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_QUART }}
              className="pointer-events-auto rounded-lg border border-line bg-surface p-3.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 ${m.tone} ${m.spin ? "animate-spin-slow" : ""}`}>
                  <Icon name={m.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-fg">{t.label}</p>
                  {t.message && <p className="mt-0.5 text-xms text-fg-2">{t.message}</p>}
                  {t.hash && (
                    <a
                      href={explorerTx(t.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xms text-fg-3 transition-colors hover:text-accent"
                    >
                      <span className="nums">
                        {t.hash.slice(0, 10)}…{t.hash.slice(-6)}
                      </span>
                      <Icon name="external" size={11} />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(t.id)}
                  className="rounded-sm p-0.5 text-fg-3 transition-colors hover:text-fg"
                  aria-label="Dismiss"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
