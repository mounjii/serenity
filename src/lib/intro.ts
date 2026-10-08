export const INTRO_SEEN_KEY = "touch-sense-intro";

/**
 * Runs before the first paint (inline in <head>) so the intro covers the page from the very first
 * frame, and returning visitors never see it flash.
 */
export const INTRO_BOOT_SCRIPT = `try{if(/^\\/(fr|ar)?\\/?$/.test(location.pathname)&&!sessionStorage.getItem("${INTRO_SEEN_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="play"}}catch(e){}`;
