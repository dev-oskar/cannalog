# Tolerance Break Feature — Design Spec

**Date:** 2026-03-11
**Status:** Approved

## Overview

Add tolerance break tracking to CannaLog. Users can declare intentional breaks or have them detected passively (gap > 2 days between sessions). The feature is motivational-first: countdown to goal, streak display, encouragement. Analytics (pre/post break usage comparison) is a future phase.

## Data Model

### New table: `tolerance_breaks`

```sql
CREATE TABLE tolerance_breaks (
  break_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date  timestamptz NOT NULL,
  end_date    timestamptz,
  goal_days   integer,
  break_type  text NOT NULL CHECK (break_type IN ('intentional', 'passive')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON tolerance_breaks (user_id, end_date);
```

**Active break** = row where `end_date IS NULL` for the current user. Only one active break at a time (enforced at application level — check before inserting).

### Hasura setup

- Track the table in Hasura console
- Add row-level permission: users can only select/insert/update their own rows (`user_id = X-Hasura-User-Id`)
- Expose mutations: `insert_tolerance_breaks_one`, `update_tolerance_breaks_by_pk`

## Backend Integration

### Session creation side-effects (`POST /api/sessions/create`)

After validating auth but before returning success:

1. Query the user's most recent session timestamp (`getTimeSinceLastSession()`)
2. Query for any active break (`getActiveBreak()`)
3. **If active break exists** → close it: `UPDATE tolerance_breaks SET end_date = now() WHERE break_id = <id>`
4. **Else if gap > 2 days and no active break** → backfill a passive break:
   - `start_date = last_session.created_at` (start of the gap)
   - `end_date = now()`
   - `break_type = 'passive'`
5. Continue with normal session insert

### New API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/breaks/start` | POST | Start an intentional break. Body: `{ goal_days?: number }`. Rejects if active break exists. |
| `/api/breaks/cancel` | POST | Cancel the active break (sets `end_date = now()`). |

## GraphQL Layer

**New queries** in `src/lib/queries.ts`:

- `getActiveBreak(userId)` — returns active break row + computed `elapsed_days`
- `getPastBreaks(userId)` — returns all closed breaks, ordered by `start_date DESC`

**New mutations** in `src/lib/mutations.ts`:

- `startBreak(userId, goalDays?)` — inserts intentional break
- `closeBreak(breakId)` — sets `end_date = now()`

## Frontend

### Dashboard card (`/dashboard`)

**When break is active:**
- Current streak in days (elapsed since `start_date`)
- Progress bar toward `goal_days` (hidden if no goal set)
- Motivational message: "Day 5 of 21 — keep going!" / "Day 3 — great start!"
- "Log a session" link (ends the break implicitly)

**When no break is active:**
- Days since last session
- "Start a T-break" CTA button → navigates to `/dashboard/breaks`

### Dedicated page (`/dashboard/breaks`)

- Active break card (expanded version of dashboard widget)
- "Start T-break" form: optional goal duration (number input, days)
- "Cancel break" button (when active)
- Past breaks list: date range, total days, type badge (`intentional` / `passive`)

### Sidebar

Add "T-Break" nav item to `src/components/Sidebar.astro`. Positioned after Sessions.

### i18n

New `"breaks"` section in `src/i18n/en.json` and `pl.json`:

```json
"breaks": {
  "title": "Tolerance Break",
  "nav": "T-Break",
  "active_break": "Active Break",
  "start_break": "Start T-Break",
  "cancel_break": "Cancel Break",
  "goal_days_label": "Goal duration (days)",
  "goal_days_placeholder": "e.g. 21",
  "day_streak": "Day {{count}}",
  "motivational_with_goal": "Day {{elapsed}} of {{goal}} — keep going!",
  "motivational_no_goal": "Day {{elapsed}} — great work!",
  "no_active_break": "No active break",
  "days_since_last": "{{count}} days since last session",
  "start_cta": "Start a T-Break",
  "past_breaks": "Past Breaks",
  "break_type_intentional": "Intentional",
  "break_type_passive": "Passive",
  "break_duration": "{{days}} days"
}
```

## What's Out of Scope (Future)

- Analytics: pre/post break usage amount comparison
- Notifications / reminders during a break
- Break streaks (longest break, total break days this year)
- Social / sharing features
