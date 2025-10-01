import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../lib/nhost-server";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    console.log("[SIGNIN] Starting sign-in process...");

    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      console.log("[SIGNIN] Missing credentials");
      return redirect("/signin?error=missing-credentials");
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
      return redirect(`/signin?error=signin-failed`);
    }

    console.log(
      "[SIGNIN] Sign-in successful, session cookies set, redirecting to dashboard..."
    );
    return redirect("/dashboard");
  } catch (error) {
    console.error("[SIGNIN] Unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return redirect(
      `/signin?error=server-error&details=${encodeURIComponent(errorMessage)}`
    );
  }
};
