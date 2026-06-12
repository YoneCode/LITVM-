import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold " +
  "transition-[background,border-color,color,transform] duration-fast ease-quart " +
  "active:scale-[0.98] disabled:opacity-35 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  // amber fill, background-colored text — the dashboard's primary action
  primary: "bg-accent text-bg hover:bg-accent-hover",
  secondary: "bg-transparent text-fg-2 border border-line hover:border-line-hover hover:text-fg",
  ghost: "bg-transparent text-fg-2 hover:text-fg",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type AsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string; external?: boolean };

export function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { external, href } = props;
    const ext = external ?? href.startsWith("http");
    return (
      <Link
        href={href}
        className={classes}
        {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as AsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
