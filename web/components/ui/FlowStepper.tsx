import { Fragment } from "react";
import { cn } from "@/lib/cn";

/**
 * The dashboard's wrap → deposit → earn flow guide, lifted as a primitive.
 * Numbered amber chips joined by arrows.
 */
export function FlowStepper({
  steps,
  className,
}: {
  steps: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md bg-accent-subtle px-5 py-3 text-sm text-fg-2",
        className
      )}
    >
      {steps.map((step, i) => (
        <Fragment key={step}>
          <span className="flex items-center gap-2">
            <span className="grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-full bg-accent-muted text-[10px] font-bold text-accent">
              {i + 1}
            </span>
            {step}
          </span>
          {i < steps.length - 1 && (
            <span aria-hidden className="text-fg-3">
              &rarr;
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
