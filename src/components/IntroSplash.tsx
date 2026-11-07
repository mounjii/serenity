"use client";

import { useEffect, useRef, useState } from "react";

const HOLD_MS = 1700;
const FADE_MS = 650;

/** Homepage load: the stacked logo fills the screen, then the site fades in. */
export default function IntroSplash() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "play") {
      const hide = window.setTimeout(() => setDone(true), 0);
      return () => window.clearTimeout(hide);
    }

    const timers: number[] = [];
    let finishing = false;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const finish = () => {
      if (finishing) return;
      finishing = true;
      timers.forEach(clearTimeout);
      delete html.dataset.intro;
      setDone(true);
    };

    const reveal = () => {
      const overlay = overlayRef.current;
      if (!overlay || reduce) return finish();
      html.dataset.intro = "leaving";
      overlay.style.transition = `opacity ${FADE_MS}ms ease`;
      overlay.style.opacity = "0";
      timers.push(window.setTimeout(finish, FADE_MS + 40));
    };

    timers.push(window.setTimeout(reveal, reduce ? 900 : HOLD_MS));
    const armSkip = window.setTimeout(() => {
      window.addEventListener("pointerdown", finish, { once: true });
      window.addEventListener("keydown", finish, { once: true });
    }, 500);
    timers.push(armSkip);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className="intro-overlay fixed inset-0 z-[100] bg-ivory"
      aria-hidden
    >
      {/* Plain img so the splash is on the first frame and skips the optimizer cache. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-mark.png?v=4"
        alt=""
        width={1024}
        height={1024}
        className="h-auto w-[min(78vw,420px)]"
      />
    </div>
  );
}
