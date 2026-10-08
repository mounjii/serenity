import Image from "next/image";
import Link from "next/link";

type Props = { className?: string; variant?: "horizontal" | "stacked" };

export default function Logo({ className = "", variant = "horizontal" }: Props) {
  return (
    <Link href="/" aria-label="Touch Sense Thai Massage — home" className={`inline-flex shrink-0 ${className}`}>
      {variant === "stacked" ? (
        <Image src="/images/ts-logo-black.webp" alt="Touch Sense Thai Massage" width={745} height={144} className="h-11 w-auto sm:h-14" />
      ) : (
        <Image
          src="/images/ts-logo-black.webp"
          alt="Touch Sense Thai Massage"
          width={745}
          height={144}
          priority
          data-nav-logo
          className="h-10 w-auto sm:h-11"
        />
      )}
    </Link>
  );
}
