import type { APIRoute } from "astro";
import type { Session } from "../../../types/db-types";
import { createNhostServerClient } from "../../../lib/nhost";

interface SessionMutationResponse {
  insert_sessions_one: Session;
}

type GraphQLResponse = {
  data?: SessionMutationResponse;
  error?: Error;
};

const INSERT_SESSION_MUTATION = `
mutation InsertSessions($created_by: uuid!, $strain_used: uuid!, $usage_method: String!, $amount: Int!, $notes: String, $effects: [String!]) {
  insert_sessions_one(object: {
    created_by: $created_by,
    strain_used: $strain_used,
    usage_method: $usage_method,
    amount: $amount,
    notes: $notes,
    effects: $effects
  }) {
    session_id
    created_by
    strain_used
    usage_method
    amount
    created_at
    effects
    notes
  }
}
`;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const nhost = await createNhostServerClient(cookies);
    // Explicitly cast to any to avoid TypeScript errors with NhostClient type
    const session = (nhost.auth as any).getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as Session;

    // Validate required fields
    if (!body.strain_used || !body.usage_method || !body.amount) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newVariables = {
      created_by: userId,
      strain_used: body.strain_used,
      usage_method: body.usage_method,
      amount: body.amount,
      notes: body.notes || null,
      effects: body.effects || null,
    };

    const response = await nhost.graphql.request<GraphQLResponse>({
      query: INSERT_SESSION_MUTATION,
      variables: newVariables,
    });
    const data = (response as any).body?.data;

    return new Response(
      JSON.stringify({
        session: data.insert_sessions_one,
        message: "Session created successfully",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("API Route Error: \n", e);
    return new Response(
      JSON.stringify({ message: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
