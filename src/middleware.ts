import { defineMiddleware } from "astro:middleware";
import { handleNhostMiddleware } from "./lib/nhost-server";
import { getLangFromUrl, useTranslatedPath } from "./i18n/utils";
import { defaultLang } from "./i18n/ui";

// Define route patterns that don't require authentication (without language prefix)
const publicRoutePatterns = [
  // Core public pages
  { path: "/", exact: true },
  { path: "/signin", exact: true },
  { path: "/register", exact: true },
  { path: "/verify-email", exact: true },

  // API routes that should be public
  { path: "/api/signin", exact: true },
  { path: "/api/signout", exact: true },
  { path: "/api/signup", exact: true },

  // Static assets (for performance)
  { path: "/_astro/", prefix: true },
  { path: "/favicon.", prefix: true },
  { path: "/robots.txt", exact: true },
  { path: "/sitemap", prefix: true },
];

/**
 * Extract the path without language prefix for route checking
 */
function getPathWithoutLang(pathname: string, lang: string): string {
  // Always strip language prefix for API routes
  if (pathname.includes("/api/")) {
    const parts = pathname.split("/");
    if (parts[1] === lang) {
      parts.splice(1, 1); // Remove the language segment
    }
    return parts.join("/");
  }

  // Normal language handling for non-API routes
  if (lang === defaultLang) {
    return pathname;
  }
  const langPrefix = `/${lang}`;
  if (pathname.startsWith(langPrefix)) {
    return pathname.substring(langPrefix.length) || "/";
  }
  return pathname;
}

/**
 * Check if a path should be publicly accessible (checking the path without language prefix)
 */
function isPublicRoute(pathname: string, lang: string): boolean {
  const pathWithoutLang = getPathWithoutLang(pathname, lang);

  return publicRoutePatterns.some((pattern) => {
    if (pattern.exact) {
      return pathWithoutLang === pattern.path;
    }
    if (pattern.prefix) {
      return pathWithoutLang.startsWith(pattern.path);
    }
    return false;
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Get the current path and extract language
  const path = context.url.pathname;
  const lang = getLangFromUrl(context.url);
  const translatePath = useTranslatedPath(lang);

  console.log(
    `[MIDDLEWARE] Processing path: ${path}, detected language: ${lang}`
  );

  // Check if this is a public route or a public asset
  const isPublic = isPublicRoute(path, lang);

  console.log(`[MIDDLEWARE] Is public route: ${isPublic}`);

  // Handle Nhost authentication and token refresh
  // Always call this to ensure session is up-to-date
  // even for public routes, so that session changes are detected
  const session = await handleNhostMiddleware(context.cookies);

  // If it's a public route, check if we should redirect authenticated users
  if (isPublic) {
    console.log(`[MIDDLEWARE] Public route detected: ${path}`);

    // For signin/register pages, redirect authenticated users to dashboard
    const pathWithoutLang = getPathWithoutLang(path, lang);
    if (
      session &&
      (pathWithoutLang === "/signin" || pathWithoutLang === "/register")
    ) {
      const localizedDashboardPath = translatePath("/dashboard");
      console.log(
        `[MIDDLEWARE] Authenticated user trying to access ${pathWithoutLang}, redirecting to: ${localizedDashboardPath}`
      );
      return context.redirect(localizedDashboardPath);
    }

    console.log(`[MIDDLEWARE] Allowing access to public route: ${path}`);
    return next();
  }

  // If no session and not a public route, redirect to localized signin
  if (!session) {
    const localizedSigninPath = translatePath("/signin");
    console.log(
      `[MIDDLEWARE] No session, redirecting to localized signin: ${localizedSigninPath} from: ${path}`
    );
    return context.redirect(`${localizedSigninPath}?error=auth-required`);
  }

  // Session exists, allow access to protected route
  console.log(`[MIDDLEWARE] Session exists, allowing access to: ${path}`);
  return next();
});
