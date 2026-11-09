"use client";

import { useEffect } from "react";
import { smoothScrollTo } from "@/lib/smooth-scroll";

/** Eased in-page jumps for the homepage sections. The visitor can interrupt the scroll at any time. */
export default function HomeScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!(target instanceof HTMLElement)) return;
      event.preventDefault();
      const next = `${url.pathname}${url.search}${url.hash}`;
      if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
        window.history.pushState(null, "", next);
      }
      smoothScrollTo(target, 1200);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
