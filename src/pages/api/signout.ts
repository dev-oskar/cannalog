import type { APIRoute } from "astro";
// import { DEFAULT_SESSION_KEY } from "@nhost/nhost-js/session";
import { getLangFromUrl, useTranslatedPath } from "../../i18n/utils";
import { defaultLang, type Lang } from "../../i18n/ui";

import { authUtils } from "../../lib/nhost";

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
    await authUtils.signOut();

    return redirect(`${translatePath("/")}?message=signout-success`);
  } catch (error) {
    console.error("[SIGNOUT] Sign-out error:", error);
    // Use default language for error case
    const translatePath = useTranslatedPath(defaultLang);
    return redirect(`${translatePath("/")}?error=signout-error`);
  }
};

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  // Same logic for POST requests (in case forms use POST)
  return GET({ cookies, redirect, request } as any);
};
