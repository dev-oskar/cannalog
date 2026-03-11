# Tolerance Break Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tolerance break tracking — users declare intentional breaks or the app detects passive ones (gap > 2 days), with a dashboard card and a dedicated `/dashboard/breaks` page showing motivational streak progress.

**Architecture:** A new `tolerance_breaks` Postgres table stores all breaks. Session creation detects and closes breaks as a side-effect. Two new API routes handle starting/cancelling intentional breaks. A `BreakCard.astro` component powers both the compact dashboard widget and the full-page view.

**Tech Stack:** Astro 5 SSR, Nhost (Hasura GraphQL + Auth), TailwindCSS v4, TypeScript, astro-icon (tabler), astro-i18n-aut

**Spec:** `docs/superpowers/specs/2026-03-11-tolerance-break-design.md`

---

## File Map

| Action | Path | Purpose |
|---|---|---|
| SQL (manual) | Hasura console | Create `tolerance_breaks` table + permissions |
| Modify | `src/types/db-types.ts` | Add `ToleranceBreak` type |
| Modify | `src/lib/queries.ts` | Add `getLastSessionTimestamp`, `getActiveBreak`, `getPastBreaks` |
| Modify | `src/lib/mutations.ts` | Add `CreateBreakInput`, `createBreak`, `closeBreak` |
| Modify | `src/pages/api/sessions/create.ts` | Detect/close breaks on session log |
| Create | `src/pages/api/breaks/start.ts` | POST — start intentional break |
| Create | `src/pages/api/breaks/cancel.ts` | POST — cancel active break |
| Modify | `src/i18n/en.json` | Add `breaks` and `sidebar.nav.tbreak` keys |
| Modify | `src/i18n/pl.json` | Same keys in Polish |
| Create | `src/components/dashboard/BreakCard.astro` | Reusable break widget (compact + full mode) |
| Modify | `src/pages/dashboard/index.astro` | Import BreakCard, pass break data |
| Create | `src/pages/dashboard/breaks/index.astro` | Dedicated breaks page |
| Modify | `src/components/Sidebar.astro` | Add T-Break nav item |

---

## Chunk 1: Schema, Types & Data Layer

### Task 1: Run the SQL migration

**Files:** Manual step — Hasura console SQL editor

- [ ] **Step 1: Open Hasura Console → Data → SQL**

Paste and run:

```sql
CREATE TABLE public.tolerance_breaks (
  break_id    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date  timestamptz NOT NULL,
  end_date    timestamptz,
  goal_days   integer,
  break_type  text        NOT NULL CHECK (break_type IN ('intentional', 'passive')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.tolerance_breaks (user_id, end_date);
```

- [ ] **Step 2: Verify**

In Hasura Console → Data → tolerance_breaks: confirm table exists with all 7 columns.

---

### Task 2: Configure Hasura permissions (manual console steps)

**Files:** Manual step — Hasura console

- [ ] **Step 1: Track the table**

Hasura Console → Data → tolerance_breaks → Track Table.

- [ ] **Step 2: Add `select` permission for role `user`**

Hasura Console → tolerance_breaks → Permissions → user → select:
- Row filter: `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
- Columns: all

- [ ] **Step 3: Add `insert` permission for role `user`**

- Row filter: none (or `{}`)
- Column presets: `user_id` → `X-Hasura-User-Id` (from session variable)
- Columns: `start_date`, `end_date`, `goal_days`, `break_type`

- [ ] **Step 4: Add `update` permission for role `user`**

- Row filter: `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
- Columns: `end_date` only

---

### Task 3: Add `ToleranceBreak` type

**Files:**
- Modify: `src/types/db-types.ts`

- [ ] **Step 1: Add type**

Append to `src/types/db-types.ts`:

```typescript
export interface ToleranceBreak {
  break_id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  goal_days: number | null;
  break_type: "intentional" | "passive";
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/db-types.ts
git commit -m "feat(breaks): add ToleranceBreak type"
```

---

### Task 4: Add break queries

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add import**

At the top of `src/lib/queries.ts`, add `ToleranceBreak` to the existing import:

```typescript
import type { Session, Strain, ToleranceBreak } from "../types/db-types";
```

- [ ] **Step 2: Add `getLastSessionTimestamp`**

Append to `src/lib/queries.ts`:

```typescript
export async function getLastSessionTimestamp(
  nhost: NhostClient,
  userId: string,
): Promise<string | null> {
  if (!userId) return null;

  const QUERY = `query GetLastSessionTimestamp($userId: uuid!) {
    sessions(
      where: { created_by: { _eq: $userId } }
      limit: 1
      order_by: { created_at: desc }
    ) {
      created_at
    }
  }`;

  const response = await nhost.graphql.request({
    query: QUERY,
    variables: { userId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const sessions = data?.sessions || [];
  return sessions.length > 0 ? sessions[0].created_at : null;
}
```

- [ ] **Step 3: Add `getActiveBreak`**

```typescript
export async function getActiveBreak(
  nhost: NhostClient,
  userId: string,
): Promise<ToleranceBreak | null> {
  if (!userId) return null;

  const QUERY = `query GetActiveBreak($userId: uuid!) {
    tolerance_breaks(
      where: { user_id: { _eq: $userId }, end_date: { _is_null: true } }
      limit: 1
    ) {
      break_id
      user_id
      start_date
      end_date
      goal_days
      break_type
      created_at
    }
  }`;

  const response = await nhost.graphql.request({
    query: QUERY,
    variables: { userId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const breaks = data?.tolerance_breaks || [];
  return breaks.length > 0 ? breaks[0] : null;
}
```

- [ ] **Step 4: Add `getPastBreaks`**

```typescript
export async function getPastBreaks(
  nhost: NhostClient,
  userId: string,
): Promise<ToleranceBreak[]> {
  if (!userId) return [];

  const QUERY = `query GetPastBreaks($userId: uuid!) {
    tolerance_breaks(
      where: { user_id: { _eq: $userId }, end_date: { _is_null: false } }
      order_by: { start_date: desc }
    ) {
      break_id
      user_id
      start_date
      end_date
      goal_days
      break_type
      created_at
    }
  }`;

  const response = await nhost.graphql.request({
    query: QUERY,
    variables: { userId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return [];
  }

  return data?.tolerance_breaks || [];
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(breaks): add getLastSessionTimestamp, getActiveBreak, getPastBreaks queries"
```

---

### Task 5: Add break mutations

**Files:**
- Modify: `src/lib/mutations.ts`

- [ ] **Step 1: Add import and input type**

Add `ToleranceBreak` to the existing import at the top of `src/lib/mutations.ts`:

```typescript
import type { Session, Strain, ToleranceBreak } from "../types/db-types";
```

Then add the input type after the existing input interfaces:

```typescript
export interface CreateBreakInput {
  user_id: string;
  start_date: string;
  end_date?: string | null;
  goal_days?: number | null;
  break_type: "intentional" | "passive";
}
```

- [ ] **Step 2: Add GraphQL mutation strings**

```typescript
const INSERT_BREAK_MUTATION = `
mutation InsertBreak(
  $user_id: uuid!,
  $start_date: timestamptz!,
  $end_date: timestamptz,
  $goal_days: Int,
  $break_type: String!
) {
  insert_tolerance_breaks_one(object: {
    user_id: $user_id,
    start_date: $start_date,
    end_date: $end_date,
    goal_days: $goal_days,
    break_type: $break_type
  }) {
    break_id
    user_id
    start_date
    end_date
    goal_days
    break_type
    created_at
  }
}
`;

const CLOSE_BREAK_MUTATION = `
mutation CloseBreak($break_id: uuid!, $end_date: timestamptz!) {
  update_tolerance_breaks_by_pk(
    pk_columns: { break_id: $break_id }
    _set: { end_date: $end_date }
  ) {
    break_id
    end_date
  }
}
`;
```

- [ ] **Step 3: Add `createBreak` function**

```typescript
export async function createBreak(
  nhost: NhostClient,
  input: CreateBreakInput,
): Promise<ToleranceBreak> {
  const response = await nhost.graphql.request({
    query: INSERT_BREAK_MUTATION,
    variables: input,
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    throw new Error(errors[0]?.message || "GraphQL Error");
  }

  if (!data?.insert_tolerance_breaks_one) {
    throw new Error("Failed to create break - no data returned");
  }

  return data.insert_tolerance_breaks_one;
}
```

- [ ] **Step 4: Add `closeBreak` function**

```typescript
export async function closeBreak(
  nhost: NhostClient,
  breakId: string,
  endDate: string,
): Promise<void> {
  const response = await nhost.graphql.request({
    query: CLOSE_BREAK_MUTATION,
    variables: { break_id: breakId, end_date: endDate },
  });

  const errors = (response as any).body?.errors;

  if (errors) {
    throw new Error(errors[0]?.message || "GraphQL Error");
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/mutations.ts
git commit -m "feat(breaks): add createBreak and closeBreak mutations"
```

---

## Chunk 2: API Routes & Session Side-Effects

### Task 6: Add break side-effects to session creation

**Files:**
- Modify: `src/pages/api/sessions/create.ts`

- [ ] **Step 1: Add imports**

Add to the existing imports at the top of `src/pages/api/sessions/create.ts`:

```typescript
import {
  createBreak,
  closeBreak,
  type CreateBreakInput,
} from "../../../lib/mutations";
import {
  getLastSessionTimestamp,
  getActiveBreak,
} from "../../../lib/queries";
```

- [ ] **Step 2: Add break side-effect logic**

Insert the following block AFTER `currentUser` is confirmed and BEFORE calling `createSession`. Place it inside the outer `try` block, after the `input` object is built but before the inner `try`:

```typescript
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
```

- [ ] **Step 3: Verify the file looks correct**

The final `create.ts` structure should be:
1. Auth check → return 401
2. Parse + validate body → return 400
3. Build `input`
4. Break side-effects block (wrapped in its own try/catch — never throws)
5. Inner try: `createSession(nhost, input)` → return 201
6. catch → return 400 / 500

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/sessions/create.ts
git commit -m "feat(breaks): detect and close tolerance breaks on session creation"
```

---

### Task 7: Create `/api/breaks/start`

**Files:**
- Create: `src/pages/api/breaks/start.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/breaks/start.ts
git commit -m "feat(breaks): add POST /api/breaks/start endpoint"
```

---

### Task 8: Create `/api/breaks/cancel`

**Files:**
- Create: `src/pages/api/breaks/cancel.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/breaks/cancel.ts
git commit -m "feat(breaks): add POST /api/breaks/cancel endpoint"
```

---

## Chunk 3: Frontend

### Task 9: Add i18n keys

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/pl.json`

- [ ] **Step 1: Add `breaks` section and sidebar nav key to `en.json`**

In `src/i18n/en.json`, add the `"breaks"` key as a new top-level section (after `"newStrain"`) and add `"tbreak"` to `sidebar.nav`:

Add to `"sidebar": { "nav": { ... } }` (after `"analytics"`):
```json
"tbreak": "T-Break"
```

Add new top-level section after `"newStrain"`:
```json
"breaks": {
  "title": "Tolerance Break",
  "pageTitle": "Tolerance Break - CannaLog",
  "activeBreak": "Active Break",
  "startBreak": "Start T-Break",
  "cancelBreak": "Cancel Break",
  "goalDaysLabel": "Goal duration (days)",
  "goalDaysPlaceholder": "e.g. 21",
  "optional": "optional",
  "dayStreak": "Day {{count}}",
  "motivationalWithGoal": "Day {{elapsed}} of {{goal}} — keep going!",
  "motivationalNoGoal": "Day {{elapsed}} — great work!",
  "goalReached": "Goal reached! Amazing job.",
  "noActiveBreak": "No active break",
  "daysSinceLast": "{{count}} days since last session",
  "startCta": "Start a T-Break",
  "pastBreaks": "Past Breaks",
  "noPastBreaks": "No past breaks yet",
  "typeIntentional": "Intentional",
  "typePassive": "Passive",
  "breakDuration": "{{days}} days",
  "errors": {
    "startFailed": "Failed to start break. Please try again.",
    "cancelFailed": "Failed to cancel break. Please try again.",
    "alreadyActive": "A break is already active."
  }
}
```

- [ ] **Step 2: Add same keys to `pl.json`**

Add `"tbreak": "Przerwa"` to `pl.json`'s `sidebar.nav` section.

Add new top-level `"breaks"` section to `pl.json`:
```json
"breaks": {
  "title": "Przerwa od THC",
  "pageTitle": "Przerwa od THC - CannaLog",
  "activeBreak": "Aktywna przerwa",
  "startBreak": "Zacznij przerwę",
  "cancelBreak": "Anuluj przerwę",
  "goalDaysLabel": "Czas trwania (dni)",
  "goalDaysPlaceholder": "np. 21",
  "optional": "opcjonalnie",
  "dayStreak": "Dzień {{count}}",
  "motivationalWithGoal": "Dzień {{elapsed}} z {{goal}} — trzymaj się!",
  "motivationalNoGoal": "Dzień {{elapsed}} — świetna robota!",
  "goalReached": "Cel osiągnięty! Niesamowita robota.",
  "noActiveBreak": "Brak aktywnej przerwy",
  "daysSinceLast": "{{count}} dni od ostatniej sesji",
  "startCta": "Zacznij przerwę od THC",
  "pastBreaks": "Poprzednie przerwy",
  "noPastBreaks": "Brak poprzednich przerw",
  "typeIntentional": "Zaplanowana",
  "typePassive": "Wykryta",
  "breakDuration": "{{days}} dni",
  "errors": {
    "startFailed": "Nie udało się rozpocząć przerwy. Spróbuj ponownie.",
    "cancelFailed": "Nie udało się anulować przerwy. Spróbuj ponownie.",
    "alreadyActive": "Przerwa jest już aktywna."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en.json src/i18n/pl.json
git commit -m "feat(breaks): add i18n keys for tolerance break feature"
```

---

### Task 10: Create `BreakCard.astro`

**Files:**
- Create: `src/components/dashboard/BreakCard.astro`

The card shows the active break status (or CTA to start one). A `compact` prop switches it between the small dashboard widget and the full display on the breaks page.

- [ ] **Step 1: Create the component**

```astro
---
import type { ToleranceBreak } from "../../types/db-types";
import { useI18n } from "../../i18n/utils";

export interface Props {
  activeBreak: ToleranceBreak | null;
  lastSessionTimestamp: string | null;
  compact?: boolean;
}

const { activeBreak, lastSessionTimestamp, compact = false } = Astro.props;
const { t, translatePath } = useI18n(Astro.url);

const now = Date.now();

// Compute elapsed days for an active break
const elapsedDays = activeBreak
  ? Math.floor((now - new Date(activeBreak.start_date).getTime()) / 86_400_000)
  : 0;

// Progress toward goal (0-100), or null if no goal set
const progressPct =
  activeBreak?.goal_days != null
    ? Math.min(100, Math.round((elapsedDays / activeBreak.goal_days) * 100))
    : null;

// Days since last session when no break is active
const daysSinceLast = lastSessionTimestamp
  ? Math.floor((now - new Date(lastSessionTimestamp).getTime()) / 86_400_000)
  : null;

// Motivational message
let motivationalMsg = "";
if (activeBreak) {
  if (progressPct !== null && progressPct >= 100) {
    motivationalMsg = t("breaks.goalReached");
  } else if (activeBreak.goal_days != null) {
    motivationalMsg = t("breaks.motivationalWithGoal")
      .replace("{{elapsed}}", String(elapsedDays))
      .replace("{{goal}}", String(activeBreak.goal_days));
  } else {
    motivationalMsg = t("breaks.motivationalNoGoal").replace(
      "{{elapsed}}",
      String(elapsedDays),
    );
  }
}
---

<div
  class={`bg-white dark:bg-secondary-800 rounded-lg shadow-md border border-primary-200 dark:border-tertiary-700 ${compact ? "p-4" : "p-6"}`}
>
  {activeBreak ? (
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
          {t("breaks.activeBreak")}
        </span>
        <span
          class={`text-xs px-2 py-0.5 rounded-full font-medium ${activeBreak.break_type === "intentional" ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-300"}`}
        >
          {activeBreak.break_type === "intentional"
            ? t("breaks.typeIntentional")
            : t("breaks.typePassive")}
        </span>
      </div>

      <div>
        <p class={`font-bold text-text-color ${compact ? "text-2xl" : "text-4xl"}`}>
          {t("breaks.dayStreak").replace("{{count}}", String(elapsedDays))}
        </p>
        <p class="text-sm text-text-color/70 mt-0.5">{motivationalMsg}</p>
      </div>

      {progressPct !== null && (
        <div>
          <div class="flex justify-between text-xs text-text-color/60 mb-1">
            <span>{elapsedDays}d</span>
            <span>{activeBreak.goal_days}d</span>
          </div>
          <div class="w-full bg-primary-100 dark:bg-secondary-700 rounded-full h-2">
            <div
              class="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all"
              style={`width: ${progressPct}%`}
            />
          </div>
        </div>
      )}

      {!compact && (
        <div class="flex gap-3 pt-2">
          <a
            href={translatePath("/dashboard/sessions/new")}
            class="text-sm text-primary-600 dark:text-primary-300 underline underline-offset-2"
          >
            {t("sidebar.nav.newSession")}
          </a>
          <button
            id="cancel-break-btn"
            type="button"
            data-confirm={t("breaks.cancelBreak") + "?"}
            data-error={t("breaks.errors.cancelFailed")}
            class="text-sm text-error underline underline-offset-2"
          >
            {t("breaks.cancelBreak")}
          </button>
        </div>
      )}
    </div>
  ) : (
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-text-color/50">
        {t("breaks.noActiveBreak")}
      </p>
      {daysSinceLast !== null && (
        <p class="text-sm text-text-color/70">
          {t("breaks.daysSinceLast").replace("{{count}}", String(daysSinceLast))}
        </p>
      )}
      <a
        href={translatePath("/dashboard/breaks")}
        class="inline-block mt-2 text-sm font-medium text-primary-600 dark:text-primary-300 underline underline-offset-2"
      >
        {t("breaks.startCta")}
      </a>
    </div>
  )}
</div>

{!compact && activeBreak && (
  <script>
    const btn = document.getElementById("cancel-break-btn");
    btn?.addEventListener("click", async () => {
      const confirmMsg = btn.dataset.confirm ?? "Cancel your active break?";
      const errorMsg = btn.dataset.error ?? "Failed to cancel break.";
      if (!confirm(confirmMsg)) return;
      const res = await fetch("/api/breaks/cancel", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      } else {
        alert(errorMsg);
      }
    });
  </script>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/BreakCard.astro
git commit -m "feat(breaks): add BreakCard component"
```

---

### Task 11: Add BreakCard to dashboard overview

**Files:**
- Modify: `src/pages/dashboard/index.astro`

- [ ] **Step 1: Add imports**

Add to the existing imports in the frontmatter:

```typescript
import BreakCard from "../../components/dashboard/BreakCard.astro";
import { getActiveBreak, getLastSessionTimestamp } from "../../lib/queries";
```

- [ ] **Step 2: Add data fetching**

Add after the existing query calls in the frontmatter:

```typescript
const activeBreak = await getActiveBreak(nhost, user?.id || "");
const lastSessionTimestamp = await getLastSessionTimestamp(nhost, user?.id || "");
```

- [ ] **Step 3: Add BreakCard to the template**

Inside the `<div class="grid md:grid-cols-2 gap-6">` (the Tile grid), add `BreakCard` as a second column:

```astro
<BreakCard
  activeBreak={activeBreak}
  lastSessionTimestamp={lastSessionTimestamp}
  compact={true}
/>
```

The grid now has two items: the existing `<Tile>` and the new `<BreakCard>`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/dashboard/index.astro
git commit -m "feat(breaks): add BreakCard widget to dashboard overview"
```

---

### Task 12: Create `/dashboard/breaks` page

**Files:**
- Create: `src/pages/dashboard/breaks/index.astro`

- [ ] **Step 1: Create the page**

```astro
---
import DashboardLayout from "../../../layouts/DashboardLayout.astro";
import BreakCard from "../../../components/dashboard/BreakCard.astro";
import { useI18n } from "../../../i18n/utils";
import { createNhostServerClient } from "../../../lib/nhost";
import { getActiveBreak, getLastSessionTimestamp, getPastBreaks } from "../../../lib/queries";

const { t, lang, translatePath } = useI18n(Astro.url);
const { user } = Astro.locals;

if (!user) return Astro.redirect(translatePath("/signin"));

const nhost = await createNhostServerClient(Astro.cookies);

const [activeBreak, lastSessionTimestamp, pastBreaks] = await Promise.all([
  getActiveBreak(nhost, user.id),
  getLastSessionTimestamp(nhost, user.id),
  getPastBreaks(nhost, user.id),
]);
---

<DashboardLayout user={user}>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-text-color">{t("breaks.title")}</h1>
    </div>

    <!-- Active break card (full mode) -->
    <BreakCard
      activeBreak={activeBreak}
      lastSessionTimestamp={lastSessionTimestamp}
      compact={false}
    />

    <!-- Start break form (only when no active break) -->
    {!activeBreak && (
      <div class="bg-white dark:bg-secondary-800 rounded-lg shadow-md border border-primary-200 dark:border-tertiary-700 p-6">
        <h2 class="text-lg font-semibold text-text-color mb-4">
          {t("breaks.startBreak")}
        </h2>
        <form id="start-break-form" class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="flex-1">
            <label
              for="goal-days"
              class="block text-sm font-medium text-text-color/70 mb-1"
            >
              {t("breaks.goalDaysLabel")}
              <span class="text-text-color/40 ml-1">({t("breaks.optional")})</span>
            </label>
            <input
              id="goal-days"
              name="goal_days"
              type="number"
              min="1"
              max="365"
              placeholder={t("breaks.goalDaysPlaceholder")}
              class="w-full rounded-md border border-primary-300 dark:border-tertiary-600 bg-white dark:bg-secondary-900 text-text-color px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            class="px-5 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
          >
            {t("breaks.startBreak")}
          </button>
        </form>
        <p
          id="break-error"
          data-already-active={t("breaks.errors.alreadyActive")}
          data-start-failed={t("breaks.errors.startFailed")}
          class="text-sm text-error mt-2 hidden"
        ></p>
      </div>
    )}

    <!-- Past breaks -->
    <div class="bg-white dark:bg-secondary-800 rounded-lg shadow-md border border-primary-200 dark:border-tertiary-700 p-6">
      <h2 class="text-lg font-semibold text-text-color mb-4">
        {t("breaks.pastBreaks")}
      </h2>
      {pastBreaks.length === 0 ? (
        <p class="text-sm text-text-color/50">{t("breaks.noPastBreaks")}</p>
      ) : (
        <ul class="divide-y divide-primary-100 dark:divide-tertiary-700">
          {pastBreaks.map((b) => {
            const start = new Date(b.start_date);
            const end = new Date(b.end_date!);
            const days = Math.max(
              1,
              Math.round((end.getTime() - start.getTime()) / 86_400_000),
            );
            return (
              <li class="py-3 flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium text-text-color">
                    {start.toLocaleDateString(lang)} → {end.toLocaleDateString(lang)}
                  </p>
                  <p class="text-xs text-text-color/50">
                    {t("breaks.breakDuration").replace("{{days}}", String(days))}
                  </p>
                </div>
                <span
                  class={`text-xs px-2 py-0.5 rounded-full font-medium ${b.break_type === "intentional" ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-300"}`}
                >
                  {b.break_type === "intentional"
                    ? t("breaks.typeIntentional")
                    : t("breaks.typePassive")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>

  </div>
</DashboardLayout>

<script>
  const form = document.getElementById("start-break-form") as HTMLFormElement | null;
  const errorEl = document.getElementById("break-error");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form || !errorEl) return;

    const goalDaysInput = form.querySelector<HTMLInputElement>("#goal-days");
    const goalDays = goalDaysInput?.value
      ? parseInt(goalDaysInput.value, 10)
      : null;

    const res = await fetch("/api/breaks/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_days: goalDays }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      const json = await res.json().catch(() => ({}));
      const alreadyActive = errorEl.dataset.alreadyActive ?? "A break is already active.";
      const startFailed = errorEl.dataset.startFailed ?? "Failed to start break. Please try again.";
      errorEl.textContent =
        json.message === "A break is already active" ? alreadyActive : startFailed;
      errorEl.classList.remove("hidden");
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/dashboard/breaks/index.astro
git commit -m "feat(breaks): add /dashboard/breaks dedicated page"
```

---

### Task 13: Add T-Break to sidebar

**Files:**
- Modify: `src/components/Sidebar.astro`

- [ ] **Step 1: Add nav item**

In `src/components/Sidebar.astro`, find the `mainNavItems` array. Add the T-Break item after the sessions item (after the `tabler:book-upload` entry):

```typescript
{
  href: i18n.translatePath("/dashboard/breaks"),
  label: i18n.t("sidebar.nav.tbreak"),
  icon: "tabler:clock-pause",
},
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Sidebar.astro
git commit -m "feat(breaks): add T-Break nav item to sidebar"
```

---

## Final Verification

- [ ] Run `pnpm dev` — no build errors
- [ ] Navigate to `/dashboard` — BreakCard widget visible
- [ ] Navigate to `/dashboard/breaks` — page loads; start form visible when no active break
- [ ] Start a break with a goal → page reloads, streak card shows Day 0 with progress bar
- [ ] Log a new session → break is auto-closed; check past breaks list on `/dashboard/breaks`
- [ ] Verify passive break: manipulate `start_date` of a session to be > 2 days ago in DB, log a new session, confirm a passive break row appears in `tolerance_breaks`
- [ ] Check Polish locale: `/pl/dashboard/breaks` renders correctly with Polish strings
- [ ] Commit any final fixes
