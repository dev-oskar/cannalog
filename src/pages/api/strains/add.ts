// src/pages/api/strains/add.ts
import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../../lib/nhost-server";
import { getUserId } from "../../../lib/auth";

interface StrainMutationResponse {
  insert_strains: {
    affected_rows: number;
    returning: Array<{
      id: string;
      name: string;
      thc_percentage: number;
      cbd_percentage: number;
      description: string;
      is_public: boolean;
      created_by: string;
      created_at: string;
      tags: string[];
      img_path: string;
    }>;
  };
}

type GraphQLResponse = {
  data?: StrainMutationResponse;
  error?: Error;
};

const INSERT_STRAIN_MUTATION = `
mutation InsertStrains($name: String!, $thc_percentage: Int!, $cbd_percentage: Int!, $description: String!, $is_public: Boolean!, $created_by: uuid!, $img_path: String!) {
  insert_strains(objects: {name: $name, thc_percentage: $thc_percentage, cbd_percentage: $cbd_percentage, description: $description, is_public: $is_public, created_by: $created_by, img_path: $img_path}) {
    affected_rows
    returning {
      id
      name
      thc_percentage
      cbd_percentage
      description
      is_public
      created_by
      created_at
      tags
      img_path
    }
  }
}
`;

export const POST: APIRoute = async ({ request, cookies }) => {
  const nhost = await createNhostServerClient(cookies);
  try {
    const formData = await request.formData();
    const currentUser = await getUserId(cookies);
    console.log("Current User ID:", currentUser);

    const thcContent = formData.get("thc-content")?.toString() || "0";
    const cbdContent = formData.get("cbd-content")?.toString() || "0";

    const newVariables = {
      name: formData.get("name")?.toString() || "",
      thc_percentage: parseFloat(thcContent),
      cbd_percentage: parseFloat(cbdContent),
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

    if (!data || !data.insert_strains) {
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

    const createdStrain = data.insert_strains.returning[0];

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
