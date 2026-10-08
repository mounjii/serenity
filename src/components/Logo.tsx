"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/client";

type Props = { className?: string; variant?: "horizontal" | "stacked" };

export default function Logo({ className = "", variant = "horizontal" }: Props) {
  const { href } = useI18n();
  return (
    <Link href={href("/")} aria-label="Touch Sense Thai Massage — home" className={`inline-flex shrink-0 ${className}`}>
      {variant === "stacked" ? (
        <Image src="/images/ts-logo-black.webp" alt="Touch Sense Thai Massage" width={745} height={144} className="h-10 w-auto sm:h-12" />
      ) : (
        <Image
          src="/images/ts-logo-black.webp"
          alt="Touch Sense Thai Massage"
          width={745}
          height={144}
          priority
          data-nav-logo
          className="h-9 w-auto sm:h-10"
        />
      )}
    </Link>
  );
}
