import { NextRequest, NextResponse } from "next/server";
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const AUTH_PAGES = ["/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decryptSession(cookie);

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/account");
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isStaffRoute = pathname.startsWith("/staff");

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isStaffRoute && session && session.role !== "staff") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isAuthPage && session) {
    const dest = session.role === "staff" ? "/staff/requests" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
