import type { APIRoute } from "astro";
import { authUtils } from "../../lib/nhost";
import { DEFAULT_SESSION_KEY } from "@nhost/nhost-js/session";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  try {
    // Sign out using the SDK
    await authUtils.signOut();

    // Clear the session cookie (this is the main cookie used by our server helpers)
    cookies.delete(DEFAULT_SESSION_KEY, { path: "/" });

    // Clear any legacy cookies that might exist
    cookies.delete("nhost-access-token", { path: "/" });
    cookies.delete("nhost-refresh-token", { path: "/" });
    cookies.delete("nhost-user", { path: "/" });

    return redirect("/?message=You have been signed out successfully");
  } catch (error) {
    console.error("[SIGNOUT] Error during signout:", error);
    // Still clear cookies even if signout fails
    cookies.delete(DEFAULT_SESSION_KEY, { path: "/" });
    cookies.delete("nhost-access-token", { path: "/" });
    cookies.delete("nhost-refresh-token", { path: "/" });
    cookies.delete("nhost-user", { path: "/" });

    return redirect("/?error=signout-error");
  }
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Same logic for POST requests (in case forms use POST)
  return GET({ cookies, redirect } as any);
};
