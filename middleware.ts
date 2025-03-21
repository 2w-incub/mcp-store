import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/webhooks",
  "/api/servers",
  "/api/recommendations",
  "/auth/sign-in",
  "/auth/sign-up",
];

export function middleware(request: NextRequest) {
  const { userId } = getAuth(request);
  const path = request.nextUrl.pathname;

  // Check if the path is a public route or starts with a public route prefix
  const isPublicRoute = publicRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );

  // Allow access if it's a public route or the user is authenticated
  if (isPublicRoute || userId) {
    return NextResponse.next();
  }

  // Redirect to sign-in for protected routes
  return NextResponse.redirect(new URL("/auth/sign-in", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
