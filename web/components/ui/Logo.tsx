import { cn } from "@/lib/cn";

/**
 * LitVM Yield brand mark — a geometric Litecoin "Ł" monogram on the amber tile.
 * Dark glyph on amber, matching the product's Warm Stone Dark identity.
 * Self-contained colors so it renders consistently anywhere (and as the favicon).
 */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="LitVM Yield"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="7.5" fill="#E0883C" />
      <path d="M12 7h4.4v12.9H24V24.4H12Z" fill="#17140E" />
      <path d="M8.6 13.4 19 9.6v3.7L8.6 17.1Z" fill="#17140E" />
    </svg>
  );
}
