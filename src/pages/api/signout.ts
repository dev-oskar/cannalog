import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  try {
    // Clear all authentication cookies
    cookies.delete("nhost-access-token", { path: "/" });
    cookies.delete("nhost-refresh-token", { path: "/" });
    cookies.delete("nhost-user", { path: "/" });

    return redirect("/?message=You have been signed out successfully");
  } catch (error) {
    return redirect("/?error=signout-error");
  }
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Same logic for POST requests (in case forms use POST)
  return GET({ cookies, redirect } as any);
};