import type { APIRoute } from "astro";
import { authUtils } from "../../lib/nhost";
import { getLangFromUrl, useTranslatedPath } from "../../i18n/utils";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const url = new URL(request.url);
    const lang = getLangFromUrl(url);
    const getTranslatedPath = useTranslatedPath(lang);

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
    const result = await authUtils.signUp(email, password);

    // Handle registration errors
    if ("error" in result && result.error) {
      console.error("Registration error:", result.error);
      return new Response(null, {
        status: 303,
        headers: {
          Location: `${getTranslatedPath(
            "/register"
          )}?error=registration-failed`,
        },
      });
    }

    // Registration successful - redirect to signin with success message
    return new Response(null, {
      status: 303,
      headers: {
        Location: `${getTranslatedPath(
          "/signin"
        )}?message=registration-success`,
      },
    });
  } catch (err) {
    // Log the error
    console.error("Unexpected error during registration:", err);

    // Create a new URL object and get the language again since we're outside the try block
    const errorUrl = new URL(request.url);
    const errorLang = getLangFromUrl(errorUrl);
    const errorTranslatedPath = useTranslatedPath(errorLang);

    return new Response(null, {
      status: 303,
      headers: {
        Location: `${errorTranslatedPath("/register")}?error=unexpected-error`,
      },
    });
  }
};
