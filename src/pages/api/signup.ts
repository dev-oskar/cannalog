import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../lib/nhost";
import { getLangFromUrl, createPathTranslator } from "../../i18n/utils";
import type { FetchError } from "@nhost/nhost-js/fetch";
import type { ErrorResponse } from "@nhost/nhost-js/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Helpers for redirects
  const url = new URL(request.url);
  const lang = getLangFromUrl(url);
  const getTranslatedPath = createPathTranslator(lang);

  try {
    const formData = await request.formData();

    // Get form data
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm-password")?.toString();
    const terms = formData.get("terms");

    // Basic validation
    if (!email || !password || !confirmPassword) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `${getTranslatedPath("/register")}?error=missing-fields`,
        },
      });
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `${getTranslatedPath("/register")}?error=password-mismatch`,
        },
      });
    }

    // Terms acceptance check
    if (terms !== "on") {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `${getTranslatedPath("/register")}?error=terms-required`,
        },
      });
    }

    // Attempt registration with Nhost
    const nhost = await createNhostServerClient(cookies);
    
    const response = await nhost.auth.signUpEmailPassword({ email, password });

    if (response.body?.session) {
      // Registration successful - redirect to signin with success message
      return new Response(null, {
        status: 303,
        headers: {
          Location: `${getTranslatedPath("/signin")}?message=registration-success`,
        },
      });
    } else {
        // Fallback if no session is returned but no error was thrown (e.g. email verification required with no auto-login)
        return new Response(null, {
            status: 303,
            headers: {
                Location: `${getTranslatedPath("/signin")}?message=check-email`,
            },
        });
    }

  } catch (err) {
    const error = err as FetchError<ErrorResponse>;
    console.error("Registration error:", error);

    // Prefer using the error code from the body if available, otherwise fallback to message or generic error
    const errorCode = error.body?.error || error.message || "unexpected-error";
    
    return new Response(null, {
      status: 303,
      headers: {
        Location: `${getTranslatedPath("/register")}?error=${encodeURIComponent(errorCode)}`,
      },
    });
  }
};
