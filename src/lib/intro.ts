/**
 * Runs before the first paint (inline in <head>) so the stacked logo covers the homepage
 * from the very first frame, then the page is revealed.
 */
export const INTRO_BOOT_SCRIPT = `try{if(/^\\/(fr|ar)?\\/?$/.test(location.pathname)){document.documentElement.dataset.intro="play"}}catch(e){}`;
