import type { APIRoute } from "astro";
import { createNhostServerClient } from "../../../lib/nhost";
import { closeBreak } from "../../../lib/mutations";
import { getActiveBreak } from "../../../lib/queries";

export const POST: APIRoute = async ({ cookies }) => {
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

    const activeBreak = await getActiveBreak(nhost, currentUser);
    if (!activeBreak) {
      return new Response(
        JSON.stringify({ message: "No active break to cancel" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    await closeBreak(nhost, activeBreak.break_id, new Date().toISOString());

    return new Response(JSON.stringify({ message: "Break cancelled" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("API Route Error:", e);
    return new Response(
      JSON.stringify({ message: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
