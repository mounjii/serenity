"use client";

import { ArrowUp } from "./Icons";

export default function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sand bg-white px-4 text-[0.82rem] font-medium text-ink transition hover:border-forest"
    >
      {label}
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
