// Configuration
const NHOST_SUBDOMAIN = import.meta.env.NHOST_SUBDOMAIN || process.env.NHOST_SUBDOMAIN;
const NHOST_REGION = import.meta.env.NHOST_REGION || process.env.NHOST_REGION;
const NHOST_AUTH_URL = `https://${NHOST_SUBDOMAIN}.auth.${NHOST_REGION}.nhost.run/v1`;

// Simple nhost client replacement - just the URLs we need
export const nhost = {
  auth: {
    url: NHOST_AUTH_URL
  },
  graphql: {
    url: `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1`
  }
};

// Auth utility functions using direct API calls
export const authUtils = {
  async signUp(email: string, password: string) {
    try {
      const response = await fetch(`${NHOST_AUTH_URL}/signup/email-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        return { error: { message: `HTTP ${response.status}: ${errorText}` } };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return { error: { message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` } };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${NHOST_AUTH_URL}/signin/email-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Signin response error:", errorText);
        return { error: { message: `HTTP ${response.status}: ${errorText}` } };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Signin fetch error:", error);
      return { error: { message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` } };
    }
  },

  async signOut(accessToken: string) {
    const response = await fetch(`${NHOST_AUTH_URL}/signout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  },

  async getUser(accessToken: string) {
    const response = await fetch(`${NHOST_AUTH_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  },
};

export default nhost;