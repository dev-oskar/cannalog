import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard"];
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for our custom session cookies
    const accessToken = context.cookies.get("nhost-access-token")?.value;
    const userCookie = context.cookies.get("nhost-user")?.value;
    
    const isAuthenticated = accessToken && userCookie;
    
    if (!isAuthenticated) {
      return context.redirect("/signin?error=auth-required");
    }
  }

  // Continue to the route
  return next();
});