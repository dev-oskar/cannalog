// src/pages/api/strains/add.ts
import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../../lib/nhost";
import { createStrain, type CreateStrainInput } from "../../../lib/mutations";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const nhost = await createNhostServerClient(cookies);
    // Explicitly cast to any to avoid TypeScript errors with NhostClient type
    const session = nhost.getUserSession();
    const currentUser = session?.user?.id;

    if (!currentUser) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await request.formData();

    const thcPercentage = formData.get("thc-content")?.toString() || "0";
    const cbdPercentage = formData.get("cbd-content")?.toString() || "0";

    // Convert percentages to milligrams (multiply by 10 to convert to mg)
    // e.g., 18% = 180mg, 0.2% = 20mg
    const thcValue = Math.round(parseFloat(thcPercentage) * 10);
    const cbdValue = Math.round(parseFloat(cbdPercentage) * 10);

    // Validate the values
    if (isNaN(thcValue) || isNaN(cbdValue)) {
      return new Response(
        JSON.stringify({
          message: "Invalid THC or CBD percentage value",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const input: CreateStrainInput = {
      name: formData.get("name")?.toString() || "",
      thc_content: thcValue,
      cbd_content: cbdValue,
      description: formData.get("notes")?.toString() || "",
      created_by: currentUser,
      is_public: true,
      img_path: "",
    };

    try {
      const createdStrain = await createStrain(nhost, input);

      return redirect(`/dashboard/strains/${createdStrain.id}`);
    } catch (mutationError: any) {
      console.error("Mutation Error:", mutationError);
      return new Response(
        JSON.stringify({
          message: "GraphQL Mutation Failed",
          error: mutationError.message || "Failed to create strain",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (e) {
    console.error("API Route Error:", e);
    return new Response(
      JSON.stringify({ message: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
