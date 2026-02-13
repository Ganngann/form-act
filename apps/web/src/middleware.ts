import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected paths
  const isAdminPath = pathname.startsWith("/admin");
  const isTrainerPath = pathname.startsWith("/trainer");
  const isClientPath = pathname.startsWith("/dashboard");

  if (!isAdminPath && !isTrainerPath && !isClientPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("Authentication")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret && process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not defined in production environment.");
    }

    const secret = new TextEncoder().encode(jwtSecret || "super-secret-key");
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (isAdminPath && role !== "ADMIN") {
      return redirectBasedOnRole(role, request);
    }
    if (isTrainerPath && role !== "TRAINER") {
      return redirectBasedOnRole(role, request);
    }
    if (isClientPath && role !== "CLIENT") {
      return redirectBasedOnRole(role, request);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware authentication error:", error);
    // Invalid token
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

function redirectBasedOnRole(role: string, request: NextRequest) {
  if (role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  } else if (role === "TRAINER") {
    return NextResponse.redirect(new URL("/trainer", request.url));
  } else {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/trainer/:path*", "/dashboard/:path*"],
};
