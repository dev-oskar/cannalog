// src/pages/api/strains/add.ts
import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../../lib/nhost";
import type { Strain } from "../../../types/db-types";

interface StrainMutationResponse {
  insert_strains_one: Strain;
}

type GraphQLResponse = {
  data?: StrainMutationResponse;
  error?: Error;
};

const INSERT_STRAIN_MUTATION = `
mutation InsertStrains($name: String!, $thc_content: Int!, $cbd_content: Int!, $description: String!, $is_public: Boolean!, $created_by: uuid!, $img_path: String!) {
  insert_strains_one(object: {
    name: $name, 
    thc_content: $thc_content, 
    cbd_content: $cbd_content, 
    description: $description, 
    is_public: $is_public, 
    created_by: $created_by, 
    img_path: $img_path
  }) {
    id
    name
    thc_content
    cbd_content
    description
    is_public
    created_by
    created_at
    tags
    img_path
  }
}
`;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const nhost = await createNhostServerClient(cookies);
    // Explicitly cast to any to avoid TypeScript errors with NhostClient type
    const session = (nhost.auth as any).getSession();
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
        }
      );
    }

    const newVariables = {
      name: formData.get("name")?.toString() || "",
      thc_content: thcValue,
      cbd_content: cbdValue,
      description: formData.get("notes")?.toString() || "",
      created_by: currentUser,
      is_public: true,
      img_path: "",
    };

    console.log("New Strain Variables:", newVariables);

    // Execute the mutation using nhost.graphql.request
    const response = await nhost.graphql.request<GraphQLResponse>({
      query: INSERT_STRAIN_MUTATION,
      variables: newVariables,
    });

    // Access the data from response.body
    const data = (response as any).body?.data;
    const errors = (response as any).body?.errors;

    console.log("GraphQL Data:", data);
    console.log("GraphQL Errors:", errors);

    const error = errors ? new Error(JSON.stringify(errors)) : null;
    if (error) {
      console.error("GraphQL Error:", error);
      return new Response(
        JSON.stringify({
          message: "GraphQL Mutation Failed",
          error: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data || !data.insert_strains_one) {
      console.error("No data returned from mutation");
      return new Response(
        JSON.stringify({
          message: "Failed to create strain - no data returned",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const createdStrain = data.insert_strains_one;

    // Return the successful response
    return new Response(
      JSON.stringify({
        message: "Strain created successfully!",
        strain: createdStrain,
      }),
      {
        status: 201, // 201 Created
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("API Route Error:", e);
    return new Response(
      JSON.stringify({ message: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
