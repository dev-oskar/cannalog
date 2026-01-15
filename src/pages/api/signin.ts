import type { APIRoute } from "astro";
import { createPathTranslator } from "../../i18n/utils";
import { defaultLang } from "../../i18n/ui";
import type { Lang } from "../../i18n/ui";
import { createNhostServerClient } from "../../lib/nhost";

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  try {
    console.log("[SIGNIN] Starting sign-in process...");

    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const lang = (formData.get("lang")?.toString() || defaultLang) as Lang;

    // Create translation function for this language
    const translatePath = createPathTranslator(lang);

    if (!email || !password) {
      return redirect(`${translatePath("/signin")}?error=missing-credentials`);
    }

    const nhost = await createNhostServerClient(cookies);
    const response = await nhost.auth.signInEmailPassword({ email, password });

    if (!response.body?.session) {
      return redirect(`${translatePath("/signin")}?error=signin-failed`);
    }

    console.log("[SIGNIN] Sign-in successful");

    return redirect(translatePath("/dashboard"));
  } catch (error) {
    console.error("[SIGNIN] Unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    // Use default language for error case since we might not have form data
    const translatePath = createPathTranslator(defaultLang);
    return redirect(
      `${translatePath(
        "/signin"
      )}?error=server-error&details=${encodeURIComponent(errorMessage)}`
    );
  }
};
