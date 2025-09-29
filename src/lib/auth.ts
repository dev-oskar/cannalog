import type { AstroCookies } from 'astro';

interface User {
  name?: string;
  email?: string;
  id?: string;
  [key: string]: any;
}

interface AuthResult {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
}

/**
 * Extracts and validates user authentication from Astro cookies
 * @param cookies - Astro cookies object
 * @returns Object containing authentication status, user data, and access token
 */
export function getAuthFromCookies(cookies: AstroCookies): AuthResult {
  const accessToken = cookies.get("nhost-access-token")?.value;
  const userCookie = cookies.get("nhost-user")?.value;

  let user: User | null = null;
  let isAuthenticated = false;

  if (accessToken && userCookie) {
    try {
      user = JSON.parse(userCookie);
      isAuthenticated = true;
    } catch (error) {
      // Handle parsing error silently
      console.warn('Failed to parse user cookie:', error);
    }
  }

  return {
    isAuthenticated,
    user,
    accessToken,
  };
}

/**
 * Checks if user is authenticated and redirects to sign-in if not
 * @param cookies - Astro cookies object
 * @param redirectTo - URL to redirect to after successful authentication (optional)
 * @returns AuthResult if authenticated, throws redirect if not
 */
export function requireAuth(cookies: AstroCookies, redirectTo?: string): AuthResult {
  const authResult = getAuthFromCookies(cookies);
  
  if (!authResult.isAuthenticated) {
    const redirectUrl = redirectTo 
      ? `/signin?error=authentication-required&redirectTo=${encodeURIComponent(redirectTo)}`
      : '/signin?error=authentication-required';
    
    throw new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });
  }

  return authResult;
}