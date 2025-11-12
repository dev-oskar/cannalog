import { createClient } from "@nhost/nhost-js";
import { FetchError } from "@nhost/nhost-js/fetch";

const nhost = createClient({
  subdomain:
    import.meta.env.NHOST_SUBDOMAIN || process.env.NHOST_SUBDOMAIN || "local",
  region: import.meta.env.NHOST_REGION || process.env.NHOST_REGION || "local",
});

export const authUtils = {
  async signUp(email: string, password: string) {
    try {
      const result = await nhost.auth.signUpEmailPassword({
        email,
        password,
      });

      return result;
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  async signIn(email: string, password: string): Promise<{ success: boolean }> {
    try {
      const result = await nhost.auth.signInEmailPassword({
        email,
        password,
      });

      if (!result.body.session) {
        console.log("Sign in failed: No session created");
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      if (!(err instanceof FetchError)) {
        throw err; // Re-throw if it's not a FetchError
      }
      console.log("Sign in error:", err);
      return {
        success: false,
      };
    }
  },

  async signOut() {
    try {
      const userSession = this.getUserSession();
      if (!userSession) {
        console.log("No active session found for sign-out");
        return { success: false, message: "No active session" };
      }
      await nhost.auth.signOut({
        refreshToken: userSession.refreshToken,
        all: true,
      }); // clear all sessions
      return { success: true };
    } catch (err) {
      if (!(err instanceof FetchError)) {
        throw err; // Re-throw if it's not a FetchError
      }
      console.log("Sign out error:", err);
      return {
        success: false,
      };
    }
  },

  getUserSession() {
    return nhost.getUserSession();
  },

  getUserId() {
    const session = this.getUserSession();
    return session?.user?.id || null;
  },

  async getUser() {
    try {
      const user = await nhost.auth.getUser();
      return user.body;
    } catch (err) {
      if (!(err instanceof FetchError)) {
        throw err; // Re-throw if it's not a FetchError
      }
    }
  },
};

export default nhost;
