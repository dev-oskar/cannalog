import { defineMiddleware } from "astro:middleware";
import { handleNhostMiddleware } from "./lib/nhost-server";

// Define route patterns that don't require authentication
const publicRoutePatterns = [
  // Core public pages
  { path: "/", exact: true },
  { path: "/signin", exact: true },
  { path: "/register", exact: true },
  { path: "/verify-email", exact: true },

  // API routes (handle their own auth if needed)
  { path: "/api/", prefix: true },

  // Static assets (for performance)
  { path: "/_astro/", prefix: true },
  { path: "/favicon.", prefix: true },
  { path: "/robots.txt", exact: true },
  { path: "/sitemap", prefix: true },
];

/**
 * Check if a path should be publicly accessible
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutePatterns.some((pattern) => {
    if (pattern.exact) {
      return pathname === pattern.path;
    }
    if (pattern.prefix) {
      return pathname.startsWith(pattern.path);
    }
    return false;
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Get the current path
  const path = context.url.pathname;
  console.log(`[MIDDLEWARE] Processing path: ${path}`);

  // Check if this is a public route or a public asset
  const isPublic = isPublicRoute(path);

  console.log(`[MIDDLEWARE] Is public route: ${isPublic}`);

  // Handle Nhost authentication and token refresh
  // Always call this to ensure session is up-to-date
  // even for public routes, so that session changes are detected
  const session = await handleNhostMiddleware(context.cookies);

  console.log(
    `[MIDDLEWARE] Session found: ${!!session}, User: ${!!session?.user}, Path: ${path}`
  );

  // If it's a public route, allow access without checking auth
  if (isPublic) {
    console.log(`[MIDDLEWARE] Allowing access to public route: ${path}`);
    return next();
  }

  // If no session and not a public route, redirect to signin
  if (!session) {
    console.log(`[MIDDLEWARE] No session, redirecting to signin from: ${path}`);
    return context.redirect("/signin?error=auth-required");
  }

  // Session exists, allow access to protected route
  console.log(`[MIDDLEWARE] Session exists, allowing access to: ${path}`);
  return next();
});
