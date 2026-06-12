import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    n: "01",
    title: "Wrap zkLTC",
    body: "Native zkLTC becomes WzkLTC, a standard ERC-20 following the WETH pattern. One reversible step, no bridge, no wrapper risk beyond the contract you can read.",
  },
  {
    n: "02",
    title: "Stake into the farm",
    body: "Stake WzkLTC into the yield farm. The farm tracks your share of the pool and accrues VRT to your address every second on a reward-per-share basis. No lock-up. Withdraw your principal whenever you want.",
  },
  {
    n: "03",
    title: "Earn VRT, claim anytime",
    body: "Your VRT rewards are claimable on demand and reach your wallet directly. Want to compound? Stake your VRT in the VRT farm to earn even more. Get test VRT from the faucet (10 per 24h).",
  },
];

export function Narrative() {
  return (
    <section id="narrative" className="border-t border-line py-24 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="Why it exists"
          title="Staking infrastructure for a new chain."
          description="LitVM is Litecoin's zkEVM. This is the plumbing LTC liquidity needs: a non-custodial farm where wrapped zkLTC earns VRT, a faucet to bootstrap users, and VRT staking to compound. Rewards are paid in VRT (a testnet token at a fixed emission rate, not a dollar-denominated APR), and they genuinely reach each staker and are verifiable on-chain."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.n}
              index={i}
              className="flex flex-col gap-3 bg-surface p-7"
            >
              <span className="nums text-sm font-bold text-accent">{step.n}</span>
              <h3 className="text-base font-bold text-fg">{step.title}</h3>
              <p className="text-sm leading-relaxed text-fg-2">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
