import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/chat"];
const publicAuthRoutes = ["/login", "/signup"];

const hasSessionCookie = (request: NextRequest) =>
  Boolean(
    request.cookies.get("access_token")?.value ||
      request.cookies.get("refresh_token")?.value ||
      request.cookies.get("token")?.value,
  );

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = hasSessionCookie(request);
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicAuth = publicAuthRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicAuth && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/login", "/signup"],
};
