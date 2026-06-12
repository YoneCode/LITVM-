import { PRODUCT, NETWORK, FOOTER_LINKS, CONTRACTS, SOCIALS } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* brand + chain */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Logo size={28} className="rounded-sm" />
              <span className="text-base font-bold tracking-[0.02em] text-fg">
                {PRODUCT.name}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fg-2">
              A non-custodial staking farm on the LitVM testnet. Stake wrapped zkLTC,
              earn claimable VRT. On-chain and verifiable.
            </p>
            <p className="mt-4 text-xms text-fg-3">
              {NETWORK.name} · Chain ID {NETWORK.chainId} · Gas {NETWORK.gasToken}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={SOCIALS.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LitVM Yield on X"
                className="grid h-9 w-9 place-items-center rounded-md border border-line text-fg-2 transition-colors duration-fast ease-quart hover:border-line-hover hover:text-fg"
              >
                <Icon name="x" size={16} />
              </a>
              <a
                href={SOCIALS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LitVM Yield on GitHub"
                className="grid h-9 w-9 place-items-center rounded-md border border-line text-fg-2 transition-colors duration-fast ease-quart hover:border-line-hover hover:text-fg"
              >
                <Icon name="github" size={17} />
              </a>
            </div>
          </div>

          {/* nav links */}
          <nav className="flex gap-12" aria-label="Footer">
            <div className="flex flex-col gap-3">
              <span className="eyebrow">Network</span>
              {FOOTER_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-fg-2 transition-colors duration-fast ease-quart hover:text-accent"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* on-chain contracts — verifiable credibility */}
            <div className="flex flex-col gap-3">
              <span className="eyebrow">Contracts</span>
              {CONTRACTS.map((c) => (
                <a
                  key={c.address}
                  href={`${PRODUCT.explorer}/address/${c.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nums text-sm text-fg-3 transition-colors duration-fast ease-quart hover:text-accent"
                >
                  <span className="text-fg-2">{c.name}:</span> {c.short}
                </a>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xms text-fg-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} LitVM Yield. Testnet software, no real funds.</span>
          <span>Built on LitVM · LiteForge by Caldera</span>
        </div>
      </div>
    </footer>
  );
}
