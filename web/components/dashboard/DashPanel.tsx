import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Section header used at the top of each command-center panel. */
export function SectionTitle({
  icon,
  title,
  count,
  action,
  className,
}: {
  icon: IconName;
  title: string;
  count?: string | number;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-sm bg-surface-2 text-fg-2">
          <Icon name={icon} size={16} />
        </span>
        <h2 className="text-sm font-bold tracking-[-0.01em] text-fg">{title}</h2>
        {count != null && (
          <span className="nums rounded-full bg-surface-2 px-1.5 py-0.5 text-xms font-semibold text-fg-3">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

/** A command-center panel: header rule + body, denser than the marketing Panel. */
export function DashPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-lg border border-line bg-surface",
        className
      )}
    >
      {children}
    </section>
  );
}

export function DashPanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-5 py-4">{children}</div>
  );
}

export function DashPanelBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
