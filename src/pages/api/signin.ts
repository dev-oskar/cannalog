import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../lib/nhost-server";
import { useTranslatedPath } from "../../i18n/utils";
import { defaultLang } from "../../i18n/ui";
import type { Lang } from "../../i18n/ui";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    console.log("[SIGNIN] Starting sign-in process...");

    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const lang = (formData.get("lang")?.toString() || defaultLang) as Lang;

    // Create translation function for this language
    const translatePath = useTranslatedPath(lang);

    if (!email || !password) {
      console.log("[SIGNIN] Missing credentials");
      return redirect(`${translatePath("/signin")}?error=missing-credentials`);
    }

    // Create server-side Nhost client that can set cookies
    const nhost = await createNhostServerClient(cookies);

    // Sign in using the server client
    const result = await nhost.auth.signInEmailPassword({
      email,
      password,
    });

    console.log("[SIGNIN] Sign-in result received");

    // Check if the signin was successful by checking for session
    const session = nhost.getUserSession();
    console.log("[SIGNIN] Session after signin:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session || !session.user) {
      console.log("[SIGNIN] Sign-in failed: No session created");
      return redirect(`${translatePath("/signin")}?error=signin-failed`);
    }

    console.log(
      "[SIGNIN] Sign-in successful, session cookies set, redirecting to localized dashboard..."
    );
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
