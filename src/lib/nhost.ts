import { createServerClient, type NhostClient } from "@nhost/nhost-js";
import { DEFAULT_SESSION_KEY, type Session } from "@nhost/nhost-js/session";
import type { AstroCookies } from "astro";

const key = DEFAULT_SESSION_KEY;

/**
 * Creates an Nhost client for use in Astro server components.
 *
 */
export async function createNhostServerClient(
  cookies: AstroCookies
): Promise<NhostClient> {
  const nhost = createServerClient({
    region: import.meta.env.NHOST_REGION || process.env.NHOST_REGION || "local",
    subdomain:
      import.meta.env.NHOST_SUBDOMAIN || process.env.NHOST_SUBDOMAIN || "local",
    storage: {
      // storage compatible with Astro server components
      get: (): Session | null => {
        const sessionCookie = cookies.get(key);
        const sessionValue = sessionCookie?.value || null;
        if (!sessionValue) {
          return null;
        }
        try {
          const session = JSON.parse(sessionValue) as Session;
          return session;
        } catch {
          return null;
        }
      },
      set: (value: Session) => {
        cookies.set(key, JSON.stringify(value), {
          path: "/",
          httpOnly: true, // Secure: not accessible via client-side JS
          secure: import.meta.env.PROD,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
        });
      },
      remove: () => {
        cookies.delete(key);
      },
    },
  });

  return nhost;
}

/**
 * Middleware function to handle Nhost authentication and session management.
 *
 * This function refreshes the session and manages cookies in Astro middleware context
 */
export async function handleNhostMiddleware(
  cookies: AstroCookies
): Promise<Session | null> {
  // Check what cookies we have
  const sessionCookie = cookies.get(key);
  console.log(
    `[NHOST-SERVER] Session cookie exists: ${!!sessionCookie}, key: ${key}`
  );

  const nhost = createServerClient({
    region: import.meta.env.NHOST_REGION || process.env.NHOST_REGION || "local",
    subdomain:
      import.meta.env.NHOST_SUBDOMAIN || process.env.NHOST_SUBDOMAIN || "local",
    storage: {
      // storage compatible with Astro middleware
      get: (): Session | null => {
        const sessionCookie = cookies.get(key);
        const raw = sessionCookie?.value || null;
        if (!raw) {
          return null;
        }
        try {
          const session = JSON.parse(raw) as Session;
          console.log(
            `[NHOST-SERVER] Successfully parsed session: ${!!session.user}`
          );
          return session;
        } catch (error) {
          console.log(`[NHOST-SERVER] Failed to parse session cookie:`, error);
          return null;
        }
      },
      set: (value: Session) => {
        cookies.set(key, JSON.stringify(value), {
          path: "/",
          httpOnly: true, // Secure: not accessible via client-side JS
          secure: import.meta.env.PROD,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
        });
      },
      remove: () => {
        cookies.delete(key);
      },
    },
  });

  // we only want to refresh the session if the token will
  // expire in the next 60 seconds
  const refreshedSession = await nhost.refreshSession(60);
  return refreshedSession;
}
