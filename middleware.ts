import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Access cookies as an object
  const cookies = req.cookies;
  const userToken = cookies.get("token"); // Retrieve the 'token' cookie

  if (!userToken) {
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect to /login if no token
  }

  return NextResponse.next(); // Allow access if token exists
}

// Define routes where this middleware applies
export const config = {
  matcher: ["/dashboard.html"], // Protect the dashboard.html route
};
