import type { APIRoute } from "astro";
import { authUtils } from "../../lib/nhost";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return redirect("/signin?error=missing-credentials");
    }

    // Authenticate with Nhost
    const result = await authUtils.signIn(email, password);

    if (result.error) {
      return redirect("/signin?error=authentication-failed");
    }

    // Check if we have user data in the result
    const user = result.session?.user || result.user;
    const session = result.session;

    if (!user || !session) {
      return redirect("/signin?error=no-session");
    }

    // Set session cookies manually
    if (session.accessToken) {
      cookies.set("nhost-access-token", session.accessToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/"
      });
    }

    if (session.refreshToken) {
      cookies.set("nhost-refresh-token", session.refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      });
    }

    // Set user info cookie
    cookies.set("nhost-user", JSON.stringify(user), {
      httpOnly: false, // Allow client-side access for user info
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return redirect("/dashboard");
  } catch (error) {
    return redirect("/signin?error=server-error");
  }
};