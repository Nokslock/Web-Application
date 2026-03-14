/**
 * Tests for middleware.ts — Auth, Idle Timeout, Route Protection
 *
 * Verifies that:
 * - Unauthenticated users are redirected from protected routes
 * - Idle timeout works correctly
 * - Admin routes check for admin role
 * - Public routes pass through
 */

// --- Mock Supabase SSR ---
const mockGetUser = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: jest.fn(() => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
    })),
  })),
}));

// --- Mock Next.js server types ---
const cookieStore = new Map<string, string>();

function createMockRequest(
  path: string,
  cookies: Record<string, string> = {}
): any {
  const url = `http://localhost:3000${path}`;
  const cookieMap = new Map(Object.entries(cookies));

  return {
    url,
    nextUrl: {
      pathname: path,
    },
    headers: new Headers(),
    cookies: {
      get: (name: string) => {
        const value = cookieMap.get(name);
        return value !== undefined ? { value } : undefined;
      },
      set: jest.fn((cookie: any) => {
        cookieMap.set(cookie.name, cookie.value);
      }),
    },
  };
}

// Mock NextResponse
const mockRedirect = jest.fn();
const mockNextResponse = {
  cookies: {
    set: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({
      cookies: {
        set: jest.fn(),
        delete: jest.fn(),
      },
    })),
    redirect: jest.fn((url: URL) => ({
      status: 307,
      headers: new Headers({ Location: url.toString() }),
      cookies: {
        set: jest.fn(),
        delete: jest.fn(),
      },
      _redirectUrl: url.toString(),
    })),
  },
}));

// Import after mocks
import { middleware } from "@/middleware";
import { NextResponse } from "next/server";

// =============================================================================
// 1. PUBLIC ROUTES
// =============================================================================

describe("Middleware - Public Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows unauthenticated users to access public pages", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/");
    const response = await middleware(req);

    // Should not redirect — just pass through
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("allows unauthenticated users to access login page", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/login");
    await middleware(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("allows unauthenticated users to access pricing page", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/pricing");
    await middleware(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 2. PROTECTED ROUTES - Dashboard
// =============================================================================

describe("Middleware - Dashboard Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects unauthenticated users from /dashboard to /access-denied", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/dashboard");
    const response = await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/access-denied");
  });

  it("redirects unauthenticated users from /dashboard/vault to /access-denied", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/dashboard/vault");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/access-denied");
  });

  it("allows authenticated users to access /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const req = createMockRequest("/dashboard");
    await middleware(req);

    // Should not redirect to access-denied
    const redirectCalls = (NextResponse.redirect as jest.Mock).mock.calls;
    const accessDeniedRedirects = redirectCalls.filter(
      (call: any) => call[0]?.pathname === "/access-denied"
    );
    expect(accessDeniedRedirects).toHaveLength(0);
  });
});

// =============================================================================
// 3. ADMIN ROUTES
// =============================================================================

describe("Middleware - Admin Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects unauthenticated users from /admin to /access-denied", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/admin");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/access-denied");
  });

  it("redirects non-admin users from /admin to /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: false },
    });

    const req = createMockRequest("/admin");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/dashboard");
  });

  it("allows admin users to access /admin", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: true },
    });

    const req = createMockRequest("/admin");
    await middleware(req);

    // Should not redirect at all for admin
    const redirectCalls = (NextResponse.redirect as jest.Mock).mock.calls;
    const dashboardRedirects = redirectCalls.filter(
      (call: any) => call[0]?.pathname === "/dashboard"
    );
    expect(dashboardRedirects).toHaveLength(0);
  });
});

// =============================================================================
// 4. IDLE TIMEOUT
// =============================================================================

describe("Middleware - Idle Timeout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when session has been idle too long", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    // Set last_activity to 5 hours ago (exceeds 4-hour timeout)
    const fiveHoursAgo = Date.now() - 5 * 60 * 60 * 1000;
    const req = createMockRequest("/dashboard", {
      last_activity: fiveHoursAgo.toString(),
    });

    const response = await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("allows access when session is still active", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    // Set last_activity to 1 hour ago (within 4-hour timeout)
    const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;
    const req = createMockRequest("/dashboard", {
      last_activity: oneHourAgo.toString(),
    });

    await middleware(req);

    // Should not redirect to login
    const redirectCalls = (NextResponse.redirect as jest.Mock).mock.calls;
    const loginRedirects = redirectCalls.filter(
      (call: any) => call[0]?.pathname === "/login"
    );
    expect(loginRedirects).toHaveLength(0);
  });

  it("allows access when no last_activity cookie exists (first visit)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const req = createMockRequest("/dashboard");
    await middleware(req);

    // Should not redirect to login — first visit has no cookie
    const redirectCalls = (NextResponse.redirect as jest.Mock).mock.calls;
    const loginRedirects = redirectCalls.filter(
      (call: any) => call[0]?.pathname === "/login"
    );
    expect(loginRedirects).toHaveLength(0);
  });

  it("sets last_activity cookie on authenticated requests", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const req = createMockRequest("/dashboard");
    const response = await middleware(req);

    // The response should have set the last_activity cookie
    expect(response.cookies.set).toHaveBeenCalledWith(
      "last_activity",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 4 * 60 * 60, // IDLE_TIMEOUT_SECONDS = 14400
      })
    );
  });

  it("deletes last_activity cookie on idle timeout redirect", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const fiveHoursAgo = Date.now() - 5 * 60 * 60 * 1000;
    const req = createMockRequest("/dashboard", {
      last_activity: fiveHoursAgo.toString(),
    });

    const response = await middleware(req);

    // The redirect response should delete the cookie
    expect(response.cookies.delete).toHaveBeenCalledWith("last_activity");
  });
});

// =============================================================================
// 5. NESTED PROTECTED ROUTES
// =============================================================================

describe("Middleware - Nested Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("protects nested dashboard routes like /dashboard/settings", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/dashboard/settings");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/access-denied");
  });

  it("protects nested admin routes like /admin/users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createMockRequest("/admin/users");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/access-denied");
  });

  it("redirects non-admin from nested admin route /admin/users to /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: false },
    });

    const req = createMockRequest("/admin/users");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/dashboard");
  });
});

// =============================================================================
// 6. ADMIN EDGE CASES
// =============================================================================

describe("Middleware - Admin Edge Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /dashboard when profile is null (no profile record)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    mockSingle.mockResolvedValue({
      data: null,
    });

    const req = createMockRequest("/admin");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/dashboard");
  });

  it("redirects to /dashboard when profile exists but is_admin is undefined", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: undefined },
    });

    const req = createMockRequest("/admin");
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/dashboard");
  });
});
