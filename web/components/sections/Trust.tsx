import { Reveal } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCT, CONTRACTS } from "@/lib/constants";

const SIGNALS = [
  {
    stat: "Per-user",
    label: "Rewards reach you",
    note: "Reward-per-share accounting credits VRT to each staker's address, claimable any time, never trapped in a contract.",
  },
  {
    stat: "100%",
    label: "On-chain & non-custodial",
    note: "No off-chain accounting and no admin path to your principal. Withdraw without permission.",
  },
  {
    stat: "100M",
    label: "Fixed VRT supply",
    note: "Reward token is capped at deploy. No mint function, no stealth inflation.",
  },
  {
    stat: "No lock",
    label: "Withdraw any time",
    note: "Staking has no lock-up. Withdrawing returns your principal and pays out pending VRT in the same transaction.",
  },
];

export function Trust() {
  return (
    <section id="trust" className="border-t border-line py-24 sm:py-28">
      <div className="wrap">
        <SectionHeading
          align="center"
          eyebrow="Why you can trust it"
          title="Credibility you can verify, not claims you have to believe."
          description="There's no logo wall here; it's a new protocol on a new chain. Instead, every guarantee maps to a contract you can open in the explorer right now."
        />

        {/* signal grid */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SIGNALS.map((s, i) => (
            <Reveal key={s.label} index={i} className="flex flex-col gap-2 bg-surface p-7">
              <span className="nums text-2xl font-bold text-accent">{s.stat}</span>
              <span className="text-sm font-semibold text-fg">{s.label}</span>
              <span className="text-xs leading-relaxed text-fg-2">{s.note}</span>
            </Reveal>
          ))}
        </div>

        {/* verifiable contracts */}
        <Reveal index={1} className="mt-6">
          <Panel hover={false} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="eyebrow">Deployed contracts · LitVM 4441</span>
              <span className="flex items-center gap-1.5 text-xms text-fg-3">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                Live
              </span>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
              {CONTRACTS.map((c) => (
                <li key={c.address}>
                  <a
                    href={`${PRODUCT.explorer}/address/${c.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 bg-surface px-4 py-3 transition-colors duration-fast ease-quart hover:bg-surface-2"
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-fg">{c.name}</span>
                      <span className="text-xms text-fg-3">{c.role}</span>
                    </span>
                    <span className="nums text-xs text-fg-2">{c.short} &nearr;</span>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>
    </section>
  );
}
