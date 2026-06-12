"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NetBadge } from "@/components/ui/NetBadge";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { PRODUCT, SOCIALS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "How it works", href: "#narrative" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#trust" },
  { label: "Use cases", href: "#use-cases" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  // border/background only deepen once the page leaves the top — a state cue, not decoration
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-colors duration-fast ease-quart",
        scrolled
          ? "border-line bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-md"
          : "border-transparent bg-bg"
      )}
    >
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="#top" className="flex items-center gap-2.5" aria-label="LitVM Yield home">
          <Logo size={32} className="rounded-sm" />
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-[0.02em] text-fg">
              {PRODUCT.name}
            </span>
            <span className="text-xms text-fg-3">{PRODUCT.chainLabel}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-fg-2 transition-colors duration-fast ease-quart hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NetBadge className="hidden sm:inline-flex" />
          <div className="hidden items-center gap-1 sm:flex">
            <a
              href={SOCIALS.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LitVM Yield on X"
              className="grid h-9 w-9 place-items-center rounded-md text-fg-3 transition-colors duration-fast ease-quart hover:text-fg"
            >
              <Icon name="x" size={16} />
            </a>
            <a
              href={SOCIALS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LitVM Yield on GitHub"
              className="grid h-9 w-9 place-items-center rounded-md text-fg-3 transition-colors duration-fast ease-quart hover:text-fg"
            >
              <Icon name="github" size={17} />
            </a>
          </div>
          <Button href={PRODUCT.appUrl} size="md">
            Launch App
          </Button>
        </div>
      </div>
    </header>
  );
}
