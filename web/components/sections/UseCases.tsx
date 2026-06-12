import { Reveal } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Case = {
  tag: string;
  title: string;
  body: string;
  flow: string[];
};

const CASES: Case[] = [
  {
    tag: "For LTC holders",
    title: "Hold a vault position",
    body: "You have zkLTC on LitVM and want a standard, non-custodial vault position you can redeem on demand.",
    flow: ["Wrap zkLTC → WzkLTC", "Deposit for lyvzkLTC shares", "Redeem to WzkLTC anytime"],
  },
  {
    tag: "For the curious",
    title: "Exercise the full flow",
    body: "You're new to the chain and want to walk every contract path end-to-end without spending anything real.",
    flow: ["Claim 10 VRT from the faucet", "Wrap and deposit WzkLTC", "Withdraw whenever you like"],
  },
  {
    tag: "For testers",
    title: "Test the staking lock",
    body: "You want to verify the timelock: stake VRT, request an unstake, and confirm the 7-day delay on-chain.",
    flow: ["Stake VRT into the timelock", "Request unstake (7-day lock)", "Claim once the timer ends"],
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="border-t border-line py-24 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="In practice"
          title="Three ways people actually use it."
          description="Same contracts, different intent. Pick the flow that matches where you are."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {CASES.map((c, i) => (
            <Reveal key={c.title} index={i}>
              <Panel className="flex h-full flex-col p-7">
                <span className="eyebrow text-accent">{c.tag}</span>
                <h3 className="mt-3 text-lg font-bold text-fg">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-2">{c.body}</p>

                <ol className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
                  {c.flow.map((step, idx) => (
                    <li key={step} className="flex items-center gap-3 text-sm text-fg">
                      <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-accent-muted text-[10px] font-bold text-accent">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
