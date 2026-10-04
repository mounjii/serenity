import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/server/auth/session-token";

const LOGIN_PATH = "/admin/login";

/** First line of defence only: pages, server actions and /api/admin routes re-check the session themselves. */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  let response: NextResponse;
  if (pathname === LOGIN_PATH) {
    response = session ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  } else if (session) {
    response = NextResponse.next();
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

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
