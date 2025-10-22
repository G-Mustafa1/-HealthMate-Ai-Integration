import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const protectedPaths = ["/dashboard", "/vitals", "/reports", "/insights"];
  const currentPath = req.nextUrl.pathname;

  // ✅ If visiting protected route and no token found → redirect to home
  if (!token && protectedPaths.some((path) => currentPath.startsWith(path))) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("redirected", "true"); // optional for debugging
    return NextResponse.redirect(loginUrl);
  }

  // ✅ If logged in user visits "/" (login page) → redirect to dashboard
  if (token && currentPath === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ Otherwise continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/vitals/:path*",
    "/reports/:path*",
    "/insights/:path*",
  ],
};
