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
        <Image src="/images/ts-logo-stacked.webp" alt="Touch Sense Thai Massage" width={638} height={409} className="h-20 w-auto sm:h-24" />
      ) : (
        <Image
          src="/images/ts-logo-stacked.webp"
          alt="Touch Sense Thai Massage"
          width={638}
          height={409}
          priority
          data-nav-logo
          className="h-16 w-auto lg:h-20"
        />
      )}
    </Link>
  );
}
