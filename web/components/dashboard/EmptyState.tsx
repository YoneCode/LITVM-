import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Intentional empty state — reads as "nothing here yet, by design",
 * never as a broken or unfinished panel. Always offers the next action.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line px-6 py-10 text-center",
        className
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-md border border-line bg-bg text-fg-3">
        <Icon name={icon} size={20} />
      </span>
      <div className="max-w-xs">
        <p className="text-sm font-semibold text-fg">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-fg-2">{description}</p>
      </div>
      {action}
    </div>
  );
}
