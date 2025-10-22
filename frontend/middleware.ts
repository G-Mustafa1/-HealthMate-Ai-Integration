import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const protectedPaths = ["/dashboard", "/vitals", "/reports", "/insights"];
  const currentPath = req.nextUrl.pathname;

  if (!token && protectedPaths.some((path) => currentPath.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

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
