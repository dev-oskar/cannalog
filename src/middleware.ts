import { defineMiddleware } from "astro:middleware";
import {
  getLangFromUrl,
  createPathTranslator,
  getPathWithoutLang as getPathWithoutLangHelper,
} from "./i18n/utils";
import { defaultLang } from "./i18n/ui";
import type { Lang } from "./i18n/ui";
// import { authUtils } from "./lib/nhost";
import { handleNhostMiddleware } from "./lib/nhost";

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
 * Build a canonical path without language segments and normalize it.
 * - decodes URI
 * - strips trailing slash (unless root)
 * - strips language prefix if present (handles default language too)
 * - ensures API routes like /pl/api/... normalize to /api/...
 */
function canonicalPath(pathname: string, lang: Lang): string {
  if (!pathname) return "/";

  // decode and normalize trailing slash
  let path = decodeURI(pathname);
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  const langPrefix = `/${lang}`;

  // If it starts with a language prefix, remove it (always — this handles defaultLang variants)
  if (path.startsWith(langPrefix)) {
    path = path.substring(langPrefix.length) || "/";
  } else {
    // fall back to canonical shared helper to handle other cases
    path = getPathWithoutLangHelper(path, lang);
  }

  return path;
}

/**
 * Check if a path should be publicly accessible (matching against canonical path)
 */
function isPublicRoute(pathname: string, lang: Lang): boolean {
  const pathWithoutLang = canonicalPath(pathname, lang);

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
  const lang = getLangFromUrl(context.url) as Lang;
  const translatePath = createPathTranslator(lang);

  const isPublic = isPublicRoute(path, lang);
  const session = await handleNhostMiddleware(context.cookies);

  // If it's a public route, check if we should redirect authenticated users
  if (isPublic) {
    // For signin/register pages, redirect authenticated users to dashboard
    const pathWithoutLang = canonicalPath(path, lang);

    // NOTE: only redirect away when a user session is present
    if (
      session &&
      (pathWithoutLang === "/signin" || pathWithoutLang === "/register")
    ) {
      const localizedDashboardPath = translatePath("/dashboard");
      return context.redirect(localizedDashboardPath);
    }

    // If session exists, populate locals even for public routes (e.g. for header)
    if (session) {
      context.locals.session = session;
      context.locals.user = session.user;
    } else {
      context.locals.session = null;
      context.locals.user = null;
    }

    return next();
  }

  if (!session) {
    const localizedSigninPath = translatePath("/signin");
    console.log(
      `[MIDDLEWARE] No session, redirecting to localized signin: ${localizedSigninPath} from: ${path}`
    );
    // Ensure locals are null
    context.locals.user = null;
    context.locals.session = null;
    return context.redirect(`${localizedSigninPath}?error=auth-required`);
  }

  // Session exists, allow access to protected route
  console.log(`[MIDDLEWARE] Session exists, allowing access to: ${path}`);
  context.locals.session = session;
  context.locals.user = session.user;
  
  return next();
});
