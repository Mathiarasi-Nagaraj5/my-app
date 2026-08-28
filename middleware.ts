import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionEdge } from "@/app/lib/auth/edgeSession";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth/session";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionEdge(token);

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // Role still isn't checked here — middleware has no DB access. Real
    // authorization is still requireAdmin() on every admin API route and
    // <RequireAdmin> on every admin page. This only blocks fully
    // unauthenticated requests early.
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};