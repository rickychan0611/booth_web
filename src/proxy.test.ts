import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

describe("admin session proxy", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key");
  });

  function mockSession(valid: boolean, cookieValue?: string) {
    vi.mocked(createServerClient).mockImplementation((_url, _key, options) => ({
      auth: {
        getUser: async () => {
          if (cookieValue !== undefined) {
            await options.cookies.setAll!([
              {
                name: "session",
                value: cookieValue,
                options: { path: "/", httpOnly: true, maxAge: valid ? 3600 : 0 },
              },
            ], { "Cache-Control": "private, no-store" });
          }
          return {
            data: { user: valid ? { id: "admin" } : null },
            error: valid ? null : { message: "Refresh token expired" },
          };
        },
      },
    }) as ReturnType<typeof createServerClient>);
  }

  it("redirects an expired session to login and clears its cookie", async () => {
    mockSession(false, "");
    const response = await proxy(new NextRequest("https://booth.test/admin/events", {
      headers: { cookie: "session=expired" },
    }));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://booth.test/admin/login?returnTo=%2Fadmin%2Fevents",
    );
    expect(response.cookies.get("session")).toMatchObject({ value: "", maxAge: 0 });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("redirects a missing session and preserves the return URL", async () => {
    mockSession(false);
    const response = await proxy(new NextRequest("https://booth.test/admin/events?view=all"));

    expect(new URL(response.headers.get("location")!).searchParams.get("returnTo"))
      .toBe("/admin/events?view=all");
  });

  it("passes a refreshed session to both page rendering and the browser", async () => {
    mockSession(true, "refreshed");
    const request = new NextRequest("https://booth.test/admin/events", {
      headers: { cookie: "session=expired" },
    });
    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(request.cookies.get("session")?.value).toBe("refreshed");
    expect(response.headers.get("x-middleware-request-cookie")).toContain("session=refreshed");
    expect(response.cookies.get("session")).toMatchObject({ value: "refreshed", httpOnly: true });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("protects events without intercepting login or the login API", () => {
    for (const [url, expected] of [
      ["/admin/events", true],
      ["/admin/events/example", true],
      ["/admin/login", false],
      ["/api/admin/auth", false],
      ["/", false],
    ] as const) {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(expected);
    }
  });
});
