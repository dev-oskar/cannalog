import type { APIRoute } from "astro";
import type { Session } from "../../../types/db-types";
import { createNhostServerClient } from "../../../lib/nhost";
import { createSession, type CreateSessionInput } from "../../../lib/mutations";

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

    const input: CreateSessionInput = {
      created_by: userId,
      strain_used: body.strain_used,
      usage_method: body.usage_method,
      amount: body.amount,
      notes: body.notes || null,
      effects: body.effects || null,
    };

    try {
      const newSession = await createSession(nhost, input);
      
      return new Response(
        JSON.stringify({
          session: newSession,
          message: "Session created successfully",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (mutationError: any) {
        console.error("Mutation Error:", mutationError);
        return new Response(
            JSON.stringify({ message: mutationError.message || "Failed to create session" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
    
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
