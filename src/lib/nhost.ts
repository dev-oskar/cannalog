import nhostPkg from "@nhost/nhost-js";
const { createClient } = nhostPkg;
type NhostClient = nhostPkg.NhostClient;

// Client-side Nhost instance - this is the default client for browser usage
// Uses localStorage by default for session storage
const nhost = createClient({
  subdomain:
    import.meta.env.NHOST_SUBDOMAIN || process.env.NHOST_SUBDOMAIN || "local",
  region: import.meta.env.NHOST_REGION || process.env.NHOST_REGION || "local",
});

// Client-side auth utilities using the SDK methods (not fetch)
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

  async signIn(email: string, password: string) {
    try {
      const result = await nhost.auth.signInEmailPassword({
        email,
        password,
      });

      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  async signOut() {
    try {
      const result = await nhost.auth.signOut({ all: true }); // clear all sessions
      return result;
    } catch (error) {
      console.error("Sign out error:", error);
      return {
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  getUserSession() {
    return nhost.getUserSession();
  },

  getUser() {
    return nhost.auth.getUser();
  },
};

// Export the client for direct usage if needed
export default nhost;
