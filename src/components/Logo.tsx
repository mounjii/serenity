"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/client";

type Props = { className?: string; variant?: "horizontal" | "stacked"; flush?: boolean };

const ALT = "Thai Prakhop Herbal Massage Studio";

export default function Logo({
  className = "",
  variant = "horizontal",
  flush = false,
}: Props) {
  const { href } = useI18n();
  return (
    <Link
      href={href("/")}
      aria-label={`${ALT} — home`}
      className={`inline-flex shrink-0 items-center ${variant === "horizontal" ? "h-10 sm:h-12 lg:h-14" : ""} ${className}`}
    >
      {variant === "stacked" ? (
        <Image
          src="/images/logo-mark.png"
          alt=""
          width={1024}
          height={1024}
          className="h-28 w-auto sm:h-36"
        />
      ) : (
        <Image
          src="/images/logo-nav.png"
          alt=""
          width={1024}
          height={341}
          priority
          data-nav-logo
          className={`h-10 w-auto sm:h-12 lg:h-14 ${flush ? "" : "origin-left scale-[1.22]"}`}
        />
      )}
    </Link>
  );
}
