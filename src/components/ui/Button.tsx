import Link from "next/link";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:bg-black enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg",
  outline: "border border-sand bg-white text-ink hover:border-ink",
  ghost: "text-ink-soft hover:text-ink",
  danger: "border border-red-200 bg-white text-red-700 hover:border-red-400 hover:bg-red-50",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-8 py-3.5 text-[0.8rem]",
  sm: "min-h-9 px-4 py-2 text-[0.75rem]",
};

function classes(variant: Variant, size: Size, className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button {...rest} disabled={disabled || loading} aria-busy={loading} className={classes(variant, size, className)}>
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant = "primary", size = "md", className, ...rest }: ButtonLinkProps) {
  return <Link {...rest} className={classes(variant, size, className)} />;
}

type ButtonAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size };

/** For external links (e.g. wa.me), which next/link should not handle. */
export function ButtonAnchor({ variant = "primary", size = "md", className, ...rest }: ButtonAnchorProps) {
  return <a {...rest} className={classes(variant, size, className)} />;
}
