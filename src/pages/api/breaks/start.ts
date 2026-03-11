import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../../lib/nhost";
import { createBreak, type CreateBreakInput } from "../../../lib/mutations";
import { getActiveBreak } from "../../../lib/queries";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const nhost = await createNhostServerClient(cookies);
    const session = nhost.getUserSession();
    const currentUser = session?.user?.id;

    if (!currentUser) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existing = await getActiveBreak(nhost, currentUser);
    if (existing) {
      return new Response(
        JSON.stringify({ message: "A break is already active" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await request.json().catch(() => ({}));
    const goalDays =
      typeof body.goal_days === "number" && body.goal_days > 0
        ? body.goal_days
        : null;

    const input: CreateBreakInput = {
      user_id: currentUser,
      start_date: new Date().toISOString(),
      goal_days: goalDays,
      break_type: "intentional",
    };

    const newBreak = await createBreak(nhost, input);

    return new Response(
      JSON.stringify({ break: newBreak, message: "Break started" }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("API Route Error:", e);
    return new Response(
      JSON.stringify({ message: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
