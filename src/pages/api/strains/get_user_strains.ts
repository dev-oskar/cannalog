// src/pages/api/strains/get_user_strains.ts
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
  strains: Strain[];
}

const GET_USER_STRAINS_QUERY = `
query GetUserStrains($userId: uuid!) {
  strains(
    where: { 
      _or: [
        { created_by: { _eq: $userId } },
        { is_public: { _eq: true } }
      ]
    }
    order_by: { created_at: desc }
  ) {
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
    const currentUser = await getUserId(cookies);

    if (!currentUser) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await nhost.graphql.request({
      query: GET_USER_STRAINS_QUERY,
      variables: { userId: currentUser },
    });

    const data = (response as any).body?.data;
    const errors = (response as any).body?.errors;

    if (errors) {
      console.error("GraphQL Error:", errors);
      return new Response(
        JSON.stringify({
          message: "Failed to fetch strains",
          error: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const strains = data?.strains || [];

    // Convert THC/CBD content to percentages
    const formattedStrains = strains.map((strain: Strain) => ({
      ...strain,
      thc_content: strain.thc_content / 10,
      cbd_content: strain.cbd_content / 10,
    }));

    return new Response(
      JSON.stringify({
        strains: formattedStrains,
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
