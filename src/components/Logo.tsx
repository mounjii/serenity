import Image from "next/image";
import Link from "next/link";

type Props = { className?: string; variant?: "horizontal" | "stacked" };

export default function Logo({ className = "", variant = "horizontal" }: Props) {
  return (
    <Link href="/" aria-label="Touch Sense Thai Massage — home" className={`inline-flex shrink-0 ${className}`}>
      {variant === "stacked" ? (
        <Image src="/images/logo.png" alt="Touch Sense Thai Massage" width={650} height={451} className="h-24 w-auto" />
      ) : (
        <Image
          src="/images/logo-horizontal.png"
          alt="Touch Sense Thai Massage"
          width={986}
          height={197}
          priority
          className="h-10 w-auto sm:h-11"
        />
      )}
    </Link>
  );
}
