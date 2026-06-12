import { cn } from "@/lib/cn";

/**
 * Surface card. Identical recipe to the dashboard's .panel:
 * surface background, 1px hairline border, lg radius, border lifts on hover.
 */
export function Panel({
  className,
  hover = true,
  children,
}: {
  className?: string;
  hover?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface",
        hover && "transition-colors duration-fast ease-quart hover:border-line-hover",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  tag,
}: {
  title: string;
  tag?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <h3 className="text-base font-bold tracking-[-0.01em] text-fg">{title}</h3>
      {tag ? (
        <span className="text-xms font-medium uppercase tracking-[0.06em] text-fg-3">
          {tag}
        </span>
      ) : null}
    </div>
  );
}
