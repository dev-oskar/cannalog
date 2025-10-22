import type { AstroCookies } from "astro";
import { authUtils } from "./nhost";
import { createNhostServerClient } from "./nhost-server";

// Legacy function - using client-side authUtils
export async function requireAuth() {
  const session = await authUtils.getUserSession();
  console.log("Session:", session);
  if (session) {
    return {
      isAuthenticated: true,
      user: session.user,
      accessToken: session.accessToken,
    };
  } else {
    return {
      isAuthenticated: false,
      user: null,
      accessToken: null,
    };
  }
}

/**
 * Get the authenticated user session in Astro components
 * Usage: const session = await getSession(Astro.cookies);
 */
export async function getSession(cookies: AstroCookies) {
  try {
    const nhost = await createNhostServerClient(cookies);
    return nhost.getUserSession();
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get the authenticated user in Astro components
 * Usage: const user = await getUser(Astro.cookies);
 */
export async function getUser(cookies: AstroCookies) {
  try {
    const session = await getSession(cookies);
    return session?.user || null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated in Astro components
 * Usage: const isAuthenticated = await isAuth(Astro.cookies);
 */
export async function isAuth(cookies: AstroCookies): Promise<boolean> {
  try {
    const session = await getSession(cookies);
    return !!session && !!session.user;
  } catch (error) {
    console.error("Error checking auth:", error);
    return false;
  }
}

/**
 * Require authentication - throw error if not authenticated
 * Usage: await requireAuthServer(Astro.cookies);
 */
export async function requireAuthServer(cookies: AstroCookies) {
  const authenticated = await isAuth(cookies);
  if (!authenticated) {
    throw new Error("Authentication required");
  }
  return await getSession(cookies);
}

/**
 * Get user ID if authenticated
 * Usage: const userId = await getUserId(Astro.cookies);
 */
export async function getUserId(cookies: AstroCookies): Promise<string | null> {
  try {
    const user = await getUser(cookies);
    return user?.id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}
