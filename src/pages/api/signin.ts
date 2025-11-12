import type { APIRoute } from "astro";
import { useTranslatedPath } from "../../i18n/utils";
import { defaultLang } from "../../i18n/ui";
import type { Lang } from "../../i18n/ui";
import { authUtils } from "../../lib/nhost";

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    console.log("[SIGNIN] Starting sign-in process...");

    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const lang = (formData.get("lang")?.toString() || defaultLang) as Lang;

    // Create translation function for this language
    const translatePath = useTranslatedPath(lang);

    if (!email || !password) {
      return redirect(`${translatePath("/signin")}?error=missing-credentials`);
    }

    const response = await authUtils.signIn(email, password);

    if (!response.success) {
      return redirect(`${translatePath("/signin")}?error=signin-failed`);
    }

    console.log("[SIGNIN] Sign-in successful");

    return redirect(translatePath("/dashboard"));
  } catch (error) {
    console.error("[SIGNIN] Unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    // Use default language for error case since we might not have form data
    const translatePath = useTranslatedPath(defaultLang);
    return redirect(
      `${translatePath(
        "/signin"
      )}?error=server-error&details=${encodeURIComponent(errorMessage)}`
    );
  }
};
