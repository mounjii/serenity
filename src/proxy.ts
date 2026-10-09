import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, isLocale, localeFromAcceptLanguage, localizePath, splitLocale } from "@/i18n/config";
import { NONCE_HEADER, contentSecurityPolicy } from "@/lib/csp";
import { SESSION_COOKIE, verifySessionToken } from "@/server/auth/session-token";

const LOGIN_PATH = "/admin/login";
const ONE_YEAR = 60 * 60 * 24 * 365;

const isAdminOrApiPath = (path: string) =>
  path === "/admin" || path.startsWith("/admin/") || path === "/api" || path.startsWith("/api/");

/** First line of defence only: pages, server actions and /api/admin routes re-check the session themselves. */
async function guardAdmin(request: NextRequest, headers: Headers): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  let response: NextResponse;
  if (pathname === LOGIN_PATH) {
    response = session ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next({ request: { headers } });
  } else if (session) {
    response = NextResponse.next({ request: { headers } });
  } else if (pathname.startsWith("/api/admin")) {
    response = NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "You must be signed in." } },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  } else {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    response = NextResponse.redirect(url);
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

const remember = (response: NextResponse, locale: string) => {
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  return response;
};

/**
 * Public pages live once in the app; /fr/... and /ar/... are rewritten onto them with the language in a
 * request header. /en/... is the language switcher's way back to the unprefixed English address.
 */
function routeLocale(request: NextRequest, headers: Headers): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = new URL(`${pathname.slice(3) || "/"}${search}`, request.url);
    return remember(NextResponse.redirect(url), "en");
  }

  const { locale, path } = splitLocale(pathname);
  if (locale !== DEFAULT_LOCALE && isAdminOrApiPath(path)) {
    return NextResponse.redirect(new URL(`${path}${search}`, request.url));
  }
  if (locale !== DEFAULT_LOCALE) {
    headers.set(LOCALE_HEADER, locale);
    const response = NextResponse.rewrite(new URL(`${path}${search}`, request.url), { request: { headers } });
    return request.cookies.get(LOCALE_COOKIE)?.value === locale ? response : remember(response, locale);
  }

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = isLocale(saved) ? saved : localeFromAcceptLanguage(request.headers.get("accept-language"));
  if (preferred && preferred !== DEFAULT_LOCALE && request.method === "GET") {
    return NextResponse.redirect(new URL(`${localizePath(preferred, pathname)}${search}`, request.url));
  }

  headers.set(LOCALE_HEADER, DEFAULT_LOCALE);
  return NextResponse.next({ request: { headers } });
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);
  const headers = new Headers(request.headers);
  headers.set(NONCE_HEADER, nonce);
  headers.set("Content-Security-Policy", csp);

  const response = isAdminOrApiPath(request.nextUrl.pathname)
    ? await guardAdmin(request, headers)
    : routeLocale(request, headers);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Pages only: no API routes (except admin), Next internals or files with an extension.
  matcher: ["/((?!api/|_next/|.*\\..*).*)", "/api/admin/:path*"],
};
