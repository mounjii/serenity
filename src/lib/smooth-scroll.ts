/** Height kept free above a scroll target so the fixed navbar never covers it. */
export const NAVBAR_OFFSET = 96;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Trackpads and phones keep firing inertia events for a moment after the click that started the scroll. */
const CANCEL_GRACE_MS = 300;
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

/**
 * Eased scroll that stops when the visitor clearly takes over (scrolls, swipes, clicks or uses a
 * scroll key). Returns a function that cancels it.
 */
export function smoothScrollTo(element: HTMLElement, duration = 1100): () => void {
  const start = window.scrollY;
  const target = Math.max(0, element.getBoundingClientRect().top + start - NAVBAR_OFFSET);
  const distance = target - start;
  if (Math.abs(distance) < 2) return () => {};

  if (prefersReducedMotion()) {
    window.scrollTo({ top: target, behavior: "instant" });
    return () => {};
  }

  let frame = 0;
  let startedAt: number | null = null;
  const calledAt = performance.now();
  const events = ["wheel", "touchstart", "keydown", "mousedown"] as const;

  const stop = () => {
    cancelAnimationFrame(frame);
    for (const e of events) window.removeEventListener(e, onUserInput);
  };

  const onUserInput = (e: Event) => {
    if (performance.now() - calledAt < CANCEL_GRACE_MS) return;
    if (e instanceof KeyboardEvent && !SCROLL_KEYS.has(e.key)) return;
    stop();
  };

  const step = (now: number) => {
    startedAt ??= now;
    const progress = Math.min(1, (now - startedAt) / duration);
    // "instant" bypasses the global `scroll-behavior: smooth`, which would fight the per-frame updates.
    window.scrollTo({ top: start + distance * easeInOutCubic(progress), behavior: "instant" });
    if (progress < 1) frame = requestAnimationFrame(step);
    else stop();
  };

  for (const e of events) window.addEventListener(e, onUserInput, { passive: true });
  frame = requestAnimationFrame(step);
  return stop;
}
