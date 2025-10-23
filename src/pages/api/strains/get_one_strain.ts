// src/pages/api/strains/get_one_strain.ts
import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../../lib/nhost-server";
import { getUserId } from "../../../lib/auth";

interface Strain {
  id: string;
  name: string;
  thc_content: number;
  cbd_content: number;
  description: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  tags: string[];
  img_path: string;
}

interface StrainQueryResponse {
  strains_by_pk: Strain;
}

const GET_STRAIN_QUERY = `
query GetStrainById($id: uuid!) {
  strains_by_pk(id: $id) {
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

export const GET: APIRoute = async ({ request, cookies }) => {
  const nhost = await createNhostServerClient(cookies);
  try {
    const url = new URL(request.url);
    const strainId = url.searchParams.get("id");
    const currentUser = await getUserId(cookies);

    if (!strainId) {
      return new Response(
        JSON.stringify({ message: "Strain ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response = await nhost.graphql.request({
      query: GET_STRAIN_QUERY,
      variables: { id: strainId },
    });

    const data = (response as any).body?.data;
    const errors = (response as any).body?.errors;

    if (errors) {
      console.error("GraphQL Error:", errors);
      return new Response(
        JSON.stringify({
          message: "Failed to fetch strain",
          error: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const strain = data?.strains_by_pk;

    if (!strain) {
      return new Response(JSON.stringify({ message: "Strain not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the user has access to this strain
    if (!strain.is_public && strain.created_by !== currentUser) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        strain: {
          ...strain,
          // Convert THC/CBD content back to percentages
          thc_content: strain.thc_content / 10,
          cbd_content: strain.cbd_content / 10,
        },
      }),
      {
        status: 200,
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
