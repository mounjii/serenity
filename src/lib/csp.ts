/** Request header carrying the per-request script nonce from the proxy to the root layout. */
export const NONCE_HEADER = "x-nonce";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Only scripts carrying this request's nonce run ('strict-dynamic' lets them load Next's chunks).
 * Next.js reads the nonce from this header and adds it to its own scripts; the dev server also needs
 * eval and its websocket.
 */
export function contentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "frame-src https://www.google.com https://maps.google.com",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
}
