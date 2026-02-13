import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 1. Create a "Response" object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize the Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // This updates the request cookies so the Server Components see the new session
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // This updates the response cookies so the Browser saves the session
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // 3. Check User Session
  // This refreshes the token if expired and gets the user safely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Protect the Dashboard Route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      // If no user found, redirect to Access Denied (or Login)
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  // 5. Protect the Admin Route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }

    // Check for super_admin role
    const role = user.user_metadata?.role;
    if (role !== "super_admin") {
      // Allow access to setup-admin for initial setup if needed, but better to lock it down.
      // For now, redirect strictly.
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 5. Return the response (with any updated cookies)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
