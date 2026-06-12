import { cn } from "@/lib/cn";

/**
 * First-principles icon system.
 * One grid (24px viewBox), one stroke weight (1.5), round caps/joins,
 * everything drawn in currentColor so icons inherit text color and
 * stay visually consistent with the Inter type and amber accent.
 * No external icon dependency — the set is intentionally small and uniform.
 */

export type IconName =
  | "overview"
  | "vault"
  | "activity"
  | "shield"
  | "gauge"
  | "wallet"
  | "deposit"
  | "withdraw"
  | "claim"
  | "stake"
  | "gas"
  | "block"
  | "check"
  | "clock"
  | "alert"
  | "chevron"
  | "external"
  | "search"
  | "settings"
  | "pause"
  | "arrow-up"
  | "arrow-down"
  | "menu"
  | "close"
  | "command"
  | "github"
  | "x"
  | "dot";

const PATHS: Record<IconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  vault: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 8.75v-1.5M12 16.75v-1.5M8.75 12h-1.5M16.75 12h-1.5" />
    </>
  ),
  activity: (
    <path d="M3.5 12.5h3.5l2-6 3 12 2.5-9 1.5 3h4.5" />
  ),
  shield: (
    <>
      <path d="M12 3.5l7 2.5v5c0 4.2-2.9 7.3-7 8.5-4.1-1.2-7-4.3-7-8.5v-5l7-2.5z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M12 15l4-3.5" />
      <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
    </>
  ),
  wallet: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  deposit: (
    <>
      <path d="M12 4.5v11" />
      <path d="M8 11.5l4 4 4-4" />
      <path d="M5 19.5h14" />
    </>
  ),
  withdraw: (
    <>
      <path d="M12 15.5v-11" />
      <path d="M8 8.5l4-4 4 4" />
      <path d="M5 19.5h14" />
    </>
  ),
  claim: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M4 12.5h16" />
      <path d="M12 9V6.5M12 6.5a2 2 0 1 1 2-2c0 1.5-2 2-2 2zM12 6.5a2 2 0 1 0-2-2c0 1.5 2 2 2 2z" />
    </>
  ),
  stake: (
    <>
      <ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" />
      <path d="M5.5 6.5v5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-5" />
      <path d="M5.5 11.5v5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-5" />
    </>
  ),
  gas: (
    <>
      <path d="M6 20.5V5.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v15" />
      <path d="M5 20.5h10" />
      <path d="M6 12h8" />
      <path d="M14 8.5l2.5 2.5v6a1.5 1.5 0 0 0 3 0V10l-2.5-2.5" />
    </>
  ),
  block: (
    <>
      <path d="M12 3.5l7.5 4.25v8.5L12 20.5l-7.5-4.25v-8.5L12 3.5z" />
      <path d="M4.5 7.75L12 12l7.5-4.25M12 12v8.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.5l8.5 14.5h-17L12 4.5z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="M19 5l-8 8" />
      <path d="M18 13.5v4a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.25" />
      <path d="M15.5 15.5l4 4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.75" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </>
  ),
  pause: (
    <>
      <rect x="7" y="5" width="3.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
    </>
  ),
  "arrow-up": <path d="M12 19V5M6 11l6-6 6 6" />,
  "arrow-down": <path d="M12 5v14M6 13l6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  command: (
    <path d="M9 6.5A2.5 2.5 0 1 0 6.5 9H9V6.5zM15 6.5A2.5 2.5 0 1 1 17.5 9H15V6.5zM9 17.5A2.5 2.5 0 1 1 6.5 15H9v2.5zM15 17.5a2.5 2.5 0 1 0 2.5-2.5H15v2.5zM9 9h6v6H9z" />
  ),
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
    />
  ),
  x: (
    <path
      fill="currentColor"
      stroke="none"
      d="M17.53 3h2.79l-6.1 6.97L21.4 21h-5.62l-4.4-5.76L6.34 21H3.55l6.52-7.46L2.6 3h5.77l3.98 5.26L17.53 3Zm-.98 16.36h1.55L7.52 4.56H5.86l10.69 14.8Z"
    />
  ),
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
};

export function Icon({
  name,
  size = 18,
  className,
  strokeWidth = 1.5,
  ...rest
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
