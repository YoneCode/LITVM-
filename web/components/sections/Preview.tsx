import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { DashboardPreview } from "@/components/ui/DashboardPreview";
import { FlowStepper } from "@/components/ui/FlowStepper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCT } from "@/lib/constants";

const READOUTS = [
  ["Staked WzkLTC", "Your principal in the farm. Withdraw it any time, no lock-up."],
  ["Claimable VRT", "Rewards accrued to your address, read live and claimable on demand."],
  ["Faucet Timer", "Exact seconds until your next 10 VRT claim, read from the contract."],
  ["Reward runway", "How many days of VRT rewards remain at the current emission rate."],
];

export function Preview() {
  return (
    <section className="border-t border-line py-24 sm:py-28">
      <div className="wrap">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* explanation */}
          <div>
            <SectionHeading
              eyebrow="The product"
              title="A preview of the console you'll connect to."
              description="Same tokens, same panels, same motion as the live dashboard. In the real console every figure is a direct on-chain read, with no mocked data anywhere."
            />

            <Reveal index={1}>
              <FlowStepper
                className="mt-8"
                steps={["Wrap zkLTC", "Stake", "Earn VRT"]}
              />
            </Reveal>

            <Reveal index={2} className="mt-8">
              <dl className="flex flex-col divide-y divide-line border-y border-line">
                {READOUTS.map(([term, def]) => (
                  <div key={term} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6">
                    <dt className="w-40 flex-shrink-0 text-sm font-semibold text-fg">
                      {term}
                    </dt>
                    <dd className="text-sm leading-relaxed text-fg-2">{def}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal index={3} className="mt-8">
              <Button href={PRODUCT.appUrl} size="lg">
                Open the dashboard
              </Button>
            </Reveal>
          </div>

          {/* live preview */}
          <Reveal index={1}>
            <DashboardPreview />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
