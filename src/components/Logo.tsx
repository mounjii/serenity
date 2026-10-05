import Image from "next/image";
import Link from "next/link";

type Props = { className?: string; variant?: "horizontal" | "stacked" };

export default function Logo({ className = "", variant = "horizontal" }: Props) {
  return (
    <Link href="/" aria-label="Touch Sense Thai Massage — home" className={`inline-flex shrink-0 ${className}`}>
      {variant === "stacked" ? (
        <Image src="/images/logo.png" alt="Touch Sense Thai Massage" width={677} height={435} className="h-24 w-auto" />
      ) : (
        <Image
          src="/images/logo-horizontal.png"
          alt="Touch Sense Thai Massage"
          width={1012}
          height={193}
          priority
          className="h-9 w-auto sm:h-10"
        />
      )}
    </Link>
  );
}
