import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const protectedPaths = ["/dashboard", "/vitals", "/reports", "/insights"];
  const currentPath = req.nextUrl.pathname;

  // Agar user login nahi hai aur protected route par ja raha hai → redirect
  if (!token && protectedPaths.some((path) => currentPath.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Agar login hai → allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vitals/:path*",
    "/reports/:path*",
    "/insights/:path*",
  ],
};
