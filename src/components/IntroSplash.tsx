"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { INTRO_SEEN_KEY } from "@/lib/intro";

const HOLD_MS = 1500;
const FLIGHT_MS = 1000;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

/** First visit of the session: big centred logo that flies into its place in the navbar. */
export default function IntroSplash() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "play") return undefined;
    const timers: number[] = [];
    const finish = () => {
      timers.forEach(clearTimeout);
      delete html.dataset.intro;
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      setDone(true);
    };

    const fly = () => {
      const flyer = flyerRef.current;
      const overlay = overlayRef.current;
      const target = document.querySelector<HTMLElement>("[data-nav-logo]")?.getBoundingClientRect();
      if (!flyer || !overlay || !target || target.width === 0) return finish();

      html.dataset.intro = "leaving";
      const from = flyer.getBoundingClientRect();
      Object.assign(flyer.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, translate: "none" });
      void flyer.offsetWidth;
      flyer.style.transition = `left ${FLIGHT_MS}ms ${EASE}, top ${FLIGHT_MS}ms ${EASE}, width ${FLIGHT_MS}ms ${EASE}`;
      Object.assign(flyer.style, { left: `${target.left}px`, top: `${target.top}px`, width: `${target.width}px` });
      overlay.style.transition = `background-color ${FLIGHT_MS * 0.9}ms ease`;
      overlay.style.backgroundColor = "transparent";
      timers.push(window.setTimeout(finish, FLIGHT_MS + 60));
    };

    timers.push(window.setTimeout(fly, HOLD_MS));
    window.addEventListener("pointerdown", finish, { once: true });
    window.addEventListener("keydown", finish, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={overlayRef} className="intro-overlay fixed inset-0 z-[100] bg-cream" aria-hidden>
      <div ref={flyerRef} className="fixed top-1/2 left-1/2 w-[min(78vw,560px)] -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/images/ts-logo-black.webp"
          alt=""
          width={745}
          height={144}
          priority
          className="intro-logo-in h-auto w-full"
        />
      </div>
    </div>
  );
}
