import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "success" | "warning" | "error" | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg-2 border-line",
  accent: "bg-accent-muted text-accent border-[color-mix(in_oklab,var(--accent)_28%,transparent)]",
  success: "bg-success-bg text-success border-[color-mix(in_oklab,var(--success)_25%,transparent)]",
  warning: "bg-warning-bg text-warning border-[color-mix(in_oklab,var(--warning)_25%,transparent)]",
  error: "bg-error-bg text-error border-[color-mix(in_oklab,var(--error)_25%,transparent)]",
  muted: "bg-transparent text-fg-3 border-line",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xms font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const dotTone: Record<"live" | "pending" | "failed" | "idle", string> = {
  live: "bg-success",
  pending: "bg-warning",
  failed: "bg-error",
  idle: "bg-fg-3",
};

/** Status pill with a state dot. The dot pulses only while live/pending. */
export function StatusBadge({
  state,
  label,
  className,
}: {
  state: "live" | "pending" | "failed" | "idle";
  label: string;
  className?: string;
}) {
  const tone: Tone =
    state === "live"
      ? "success"
      : state === "pending"
        ? "warning"
        : state === "failed"
          ? "error"
          : "muted";
  const animate = state === "live" || state === "pending";
  return (
    <Badge tone={tone} className={className}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotTone[state],
          animate && "animate-pulse-dot"
        )}
      />
      {label}
    </Badge>
  );
}
