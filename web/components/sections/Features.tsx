import { Reveal } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Feature = {
  tag: string;
  title: string;
  body: string;
  points: string[];
};

const FEATURES: Feature[] = [
  {
    tag: "Farm",
    title: "Stake WzkLTC, earn VRT",
    body: "Deposit wrapped zkLTC into the yield farm and earn VRT every second, credited to your address on a reward-per-share basis. Rewards are claimable any time, and they reach you, not a vault you can't withdraw from.",
    points: ["Per-user reward accounting", "Claim anytime", "Withdraw with no lock-up"],
  },
  {
    tag: "Rewards",
    title: "Real, claimable emissions",
    body: "Each farm emits VRT at a fixed rate per second, split pro-rata across stakers. Payouts are capped at the funded reward balance, so a shortfall never blocks a withdrawal. Your principal is always retrievable.",
    points: ["Fixed VRT/sec emission", "Payout never blocks exit", "On-chain verifiable accrual"],
  },
  {
    tag: "VRT",
    title: "Faucet in, stake to compound",
    body: "A rate-limited faucet gives 10 VRT per address per 24h. Stake that VRT into the VRT farm to earn more VRT, with the same per-user reward math and no lock-up. VRT is a testnet token with no monetary value.",
    points: ["10 VRT / 24h / address", "Stake VRT → earn VRT", "Fixed 100M VRT supply"],
  },
  {
    tag: "Safety",
    title: "Boringly defensive",
    body: "Every state-changing path is reentrancy-guarded and uses SafeERC20. Farms are owner-pausable, constructors reject the zero address, and reward recovery can never touch staked principal or the reward pool.",
    points: ["ReentrancyGuard + SafeERC20", "Owner-pausable", "Principal-protected recovery"],
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-line py-24 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="What's under the hood"
          title="Four decisions that make it infrastructure."
          description="No buzzwords, just the protocol design choices you'd want to verify before depositing."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} index={i}>
              <Panel className="h-full p-7">
                <div className="flex h-full flex-col">
                  <span className="eyebrow text-accent">{f.tag}</span>
                  <h3 className="mt-3 text-lg font-bold text-fg">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-fg-2">{f.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {f.points.map((p) => (
                      <li
                        key={p}
                        className="nums rounded-sm border border-line bg-bg px-2.5 py-1 text-xms text-fg-2"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
