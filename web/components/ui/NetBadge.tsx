import { cn } from "@/lib/cn";

/** The dashboard's live-network pill: success-tinted, animated status dot. */
export function NetBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm bg-success-bg px-3 py-1 text-xms font-medium text-success",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
      LitVM 4441
    </span>
  );
}
