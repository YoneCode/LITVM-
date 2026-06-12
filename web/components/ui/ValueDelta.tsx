import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Signed delta indicator. Up = success, down = error, flat = muted.
 * Color and direction both encode the sign (not color alone — a11y).
 */
export function ValueDelta({
  value,
  suffix = "%",
  className,
}: {
  value: number | null;
  suffix?: string;
  className?: string;
}) {
  if (value === null) {
    return <span className={cn("text-xms text-fg-3", className)}>—</span>;
  }
  const flat = value === 0;
  const up = value > 0;
  const color = flat ? "text-fg-3" : up ? "text-success" : "text-error";

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xms font-medium nums", color, className)}>
      {!flat && <Icon name={up ? "arrow-up" : "arrow-down"} size={12} strokeWidth={2} />}
      {up ? "+" : ""}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}
