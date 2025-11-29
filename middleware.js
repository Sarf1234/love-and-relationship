import { NextResponse } from "next/server";
import { verifyToken } from "./src/lib/auth";

export function middleware(req) {
  const token = req.cookies.get("token")?.value || null;
  console.log("Pathname:", req.nextUrl.pathname);
  console.log("Token:", token);

  const protectedRoutes = ["/dashboard", "/admin"];
  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  console.log("Is protected:", isProtected);

  if (!isProtected) return NextResponse.next();

  if (!token) {
    console.log("Redirecting: No token");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log("Redirecting: Invalid token");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("Access allowed");
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
