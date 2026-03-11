import type { APIRoute } from "astro";
import type { Session } from "../../../types/db-types";
import { createNhostServerClient } from "../../../lib/nhost";
import { createSession, type CreateSessionInput, createBreak, closeBreak, type CreateBreakInput } from "../../../lib/mutations";
import {
  getLastSessionTimestamp,
  getActiveBreak,
} from "../../../lib/queries";

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const body = (await request.json()) as Session;

    // Validate required fields
    if (!body.strain_used || !body.usage_method || !body.amount) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const input: CreateSessionInput = {
      created_by: currentUser,
      strain_used: body.strain_used,
      usage_method: body.usage_method,
      amount: body.amount,
      notes: body.notes || null,
      effects: body.effects || null,
    };

    // --- Tolerance break side-effects (errors are logged, never abort session) ---
    try {
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
      const now = new Date().toISOString();

      const [lastSessionTimestamp, activeBreak] = await Promise.all([
        getLastSessionTimestamp(nhost, currentUser),
        getActiveBreak(nhost, currentUser),
      ]);

      if (activeBreak) {
        // Close the active break when a new session is logged
        await closeBreak(nhost, activeBreak.break_id, now);
      } else if (lastSessionTimestamp) {
        const gapMs = Date.now() - new Date(lastSessionTimestamp).getTime();
        if (gapMs > TWO_DAYS_MS) {
          // Backfill a passive break for the gap
          const passiveBreakInput: CreateBreakInput = {
            user_id: currentUser,
            start_date: lastSessionTimestamp,
            end_date: now,
            break_type: "passive",
          };
          await createBreak(nhost, passiveBreakInput);
        }
      }
    } catch (breakErr) {
      // Break side-effects must never prevent session creation
      console.error("Break side-effect error (non-fatal):", breakErr);
    }
    // --- End break side-effects ---

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
        },
      );
    } catch (mutationError: any) {
      console.error("Mutation Error:", mutationError);
      return new Response(
        JSON.stringify({
          message: mutationError.message || "Failed to create session",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (e) {
    console.error("API Route Error: \n", e);
    return new Response(
      JSON.stringify({ message: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
