/**
 * Runs before the first paint (inline in <head>) so the stacked logo covers the homepage
 * from the very first frame, then the page is revealed.
 */
export const INTRO_BOOT_SCRIPT = `try{var root=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches){root.classList.add("motion");setTimeout(function(){if(!root.dataset.motionReady)root.classList.remove("motion")},4000)}if(/^\\/(fr|ar)?\\/?$/.test(location.pathname))root.dataset.intro="play"}catch(e){}`;
