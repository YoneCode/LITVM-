/**
 * Maps raw ethers/RPC/wallet errors to short, human messages.
 * Ported from the proven frontend/app.js humanError() and extended for
 * the Privy + ethers v6 error shapes (which nest the revert reason deeper).
 */
export function humanError(e: unknown): string {
  const err = e as {
    reason?: string;
    shortMessage?: string;
    message?: string;
    code?: string | number;
    info?: { error?: { message?: string } };
    error?: { message?: string };
  };

  const raw =
    err?.reason ||
    err?.shortMessage ||
    err?.info?.error?.message ||
    err?.error?.message ||
    err?.message ||
    "";

  const r = raw.toLowerCase();

  if (err?.code === "ACTION_REJECTED" || r.includes("user rejected") || r.includes("user denied"))
    return "Transaction cancelled.";
  if (r.includes("insufficient allowance")) return "Token approval needed — approve and try again.";
  if (r.includes("insufficient balance")) return "Insufficient balance for this amount.";
  if (r.includes("wait 24h")) return "Faucet cooldown active. Come back in 24 hours.";
  if (r.includes("empty")) return "Faucet is empty — no VRT left to claim right now.";
  if (r.includes("still locked")) return "Still locked. Wait for the 7-day timelock to finish.";
  if (r.includes("already claimed")) return "This unstake request was already claimed.";
  if (r.includes("insufficient staked")) return "You don't have that much staked.";
  if (r.includes("pausable: paused") || r.includes("enforcedpause")) return "The vault is paused by the protocol.";
  if (r.includes("insufficient funds")) return "Not enough zkLTC to cover gas.";
  if (r.includes("network") && r.includes("chang")) return "Network changed mid-transaction. Try again.";
  if (r.includes("could not coalesce") || r.includes("nonce")) return "Wallet/nonce issue. Refresh and retry.";

  if (raw.length > 0 && raw.length <= 90) return raw;
  if (raw.length > 90) return raw.slice(0, 88) + "…";
  return "Transaction failed. Please try again.";
}
