import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie format: "<userId>.<role>". Routes are gated by role; the real data
// lives client-side, so this only keeps the wrong role out of a dashboard.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("melia_session")?.value.split(".")[1];

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
