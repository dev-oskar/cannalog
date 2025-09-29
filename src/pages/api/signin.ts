import type { APIRoute } from "astro";
import { authUtils } from "../../lib/nhost";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    console.log("[SIGNIN] Starting sign-in process...");
    
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    console.log("[SIGNIN] Email provided:", !!email);
    console.log("[SIGNIN] Password provided:", !!password);

    if (!email || !password) {
      console.log("[SIGNIN] Missing credentials");
      return redirect("/signin?error=missing-credentials");
    }

    // Check environment variables
    const subdomain = import.meta.env.NHOST_SUBDOMAIN || process.env.NHOST_SUBDOMAIN;
    const region = import.meta.env.NHOST_REGION || process.env.NHOST_REGION;
    console.log("[SIGNIN] Nhost config - Subdomain:", !!subdomain, "Region:", !!region);

    // Authenticate with Nhost
    console.log("[SIGNIN] Attempting authentication with Nhost...");
    const result = await authUtils.signIn(email, password);

    console.log("[SIGNIN] Auth result:", {
      hasError: !!result.error,
      hasSession: !!result.session,
      hasUser: !!(result.session?.user || result.user),
      errorMessage: result.error?.message
    });

    if (result.error) {
      console.error("[SIGNIN] Authentication failed:", result.error.message);
      return redirect(`/signin?error=authentication-failed&details=${encodeURIComponent(result.error.message)}`);
    }

    // Check if we have user data in the result
    const user = result.session?.user || result.user;
    const session = result.session;

    if (!user || !session) {
      console.error("[SIGNIN] No user or session in result");
      return redirect("/signin?error=no-session");
    }

    console.log("[SIGNIN] Authentication successful, setting cookies...");

    // Determine if we're in production (HTTPS)
    const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
    
    // Set session cookies manually
    if (session.accessToken) {
      cookies.set("nhost-access-token", session.accessToken, {
        httpOnly: true,
        secure: isProduction, // Use secure cookies in production
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/"
      });
    }

    if (session.refreshToken) {
      cookies.set("nhost-refresh-token", session.refreshToken, {
        httpOnly: true,
        secure: isProduction, // Use secure cookies in production
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      });
    }

    // Set user info cookie
    cookies.set("nhost-user", JSON.stringify(user), {
      httpOnly: false, // Allow client-side access for user info
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    console.log("[SIGNIN] Cookies set, redirecting to dashboard");
    return redirect("/dashboard");
  } catch (error) {
    console.error("[SIGNIN] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return redirect(`/signin?error=server-error&details=${encodeURIComponent(errorMessage)}`);
  }
};