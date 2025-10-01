import type { APIRoute } from "astro";
import { authUtils } from "../../lib/nhost";
import { DEFAULT_SESSION_KEY } from "@nhost/nhost-js/session";
import { getLangFromUrl, useTranslatedPath } from "../../i18n/utils";
import { defaultLang } from "../../i18n/ui";
import type { Lang } from "../../i18n/ui";

export const GET: APIRoute = async ({ cookies, redirect, request }) => {
  try {
    // Extract language from referer header to preserve language context
    const referer = request.headers.get("referer");
    let lang = defaultLang as Lang;

    if (referer) {
      try {
        const refererUrl = new URL(referer);
        lang = getLangFromUrl(refererUrl);
      } catch (e) {
        // If referer URL is invalid, use default language
        console.warn("[SIGNOUT] Invalid referer URL, using default language");
      }
    }

    const translatePath = useTranslatedPath(lang);

    // Sign out using the SDK
    await authUtils.signOut();

    // Clear the session cookie (this is the main cookie used by our server helpers)
    cookies.delete(DEFAULT_SESSION_KEY, { path: "/" });

    // Clear any legacy cookies that might exist
    cookies.delete("nhost-access-token", { path: "/" });
    cookies.delete("nhost-refresh-token", { path: "/" });
    cookies.delete("nhost-user", { path: "/" });

    return redirect(
      `${translatePath("/")}?message=You have been signed out successfully`
    );
  } catch (error) {
    console.error("[SIGNOUT] Error during signout:", error);
    // Still clear cookies even if signout fails
    cookies.delete(DEFAULT_SESSION_KEY, { path: "/" });
    cookies.delete("nhost-access-token", { path: "/" });
    cookies.delete("nhost-refresh-token", { path: "/" });
    cookies.delete("nhost-user", { path: "/" });

    // Use default language for error case
    const translatePath = useTranslatedPath(defaultLang);
    return redirect(`${translatePath("/")}?error=signout-error`);
  }
};

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  // Same logic for POST requests (in case forms use POST)
  return GET({ cookies, redirect, request } as any);
};
