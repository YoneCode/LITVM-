import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { NetBadge } from "@/components/ui/NetBadge";
import { FlowStepper } from "@/components/ui/FlowStepper";
import { PRODUCT } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <div className="wrap">
        <Reveal className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 py-16 text-center sm:px-12 sm:py-20">
          {/* masked structural backdrop, consistent with hero */}
          <div aria-hidden className="pointer-events-none absolute inset-0 grid-lines opacity-40" />

          <div className="relative mx-auto max-w-2xl">
            <div className="flex justify-center">
              <NetBadge />
            </div>

            <h2 className="mt-6 text-balance font-display text-3xl font-bold text-fg sm:text-4xl">
              Connect a wallet and exercise the contracts.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-balance text-base text-fg-2 sm:text-lg">
              On the LitVM testnet: wrap zkLTC, stake it to earn VRT, claim your
              rewards, and compound by staking VRT. Non-custodial, no lock-up, every
              move verifiable on-chain.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={PRODUCT.appUrl} size="lg">
                Open the console
              </Button>
              <Button href="#features" variant="secondary" size="lg">
                Review the design
              </Button>
            </div>

            <div className="mt-12 flex justify-center">
              <FlowStepper steps={["Wrap zkLTC", "Stake", "Earn VRT"]} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
