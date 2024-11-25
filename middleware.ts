import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Check for the authToken cookie
  const authToken = req.cookies.get('authToken');

  // If no cookie is found, redirect to the login page
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Optional: Add more checks to validate the authToken format
  const [walletAddress, timestamp] = authToken.value.split('_');

  // Example: Reject if the timestamp is too old (e.g., > 24 hours)
  const ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;
  const isExpired = Date.now() - Number(timestamp) > ONE_DAY_IN_MS;

  if (!walletAddress || isNaN(Number(timestamp)) || isExpired) {
    // Delete the expired/invalid cookie
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      path: '/',
      maxAge: 0, // Expire the cookie immediately
    });
    return response;
  }

  // If valid, allow the request to proceed
  return NextResponse.next();
}

// Apply middleware only to the /dashboard route
export const config = {
  matcher: ['/dashboard.html'],
};
