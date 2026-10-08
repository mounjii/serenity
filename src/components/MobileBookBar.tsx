"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { RESERVATION_PATH } from "@/lib/navigation";
import { ArrowRight } from "./Icons";

/**
 * Phones only: the navbar hides while scrolling down, so a booking button stays within thumb reach
 * once the hero is out of view. It steps aside when the booking banner or the footer is on screen.
 */
export default function MobileBookBar() {
  const { t, href } = useI18n();
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setPastHero(window.scrollY > window.innerHeight * 0.7);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = [document.getElementById("contact"), document.querySelector("footer")].filter((el): el is HTMLElement => el !== null);
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setBlocked(visible.size > 0);
    });
    targets.forEach((t) => observer.observe(t));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const shown = pastHero && !blocked;

  return (
    <div
      inert={!shown}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-sand/80 bg-cream/95 px-4 pt-3 pb-safe backdrop-blur-md transition-transform duration-500 md:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-serif text-[1.1rem] text-ink">Touch Sense</p>
          <p className="truncate text-[0.7rem] text-muted">{t.bookBar.hours}</p>
        </div>
        <Link
          href={href(RESERVATION_PATH)}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-ink px-6 text-[0.85rem] tracking-wide text-cream shadow-[0_12px_24px_-14px_rgba(20,18,15,0.9)]"
        >
          {t.nav.bookNow} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
