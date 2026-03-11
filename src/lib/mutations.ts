import type { NhostClient } from "@nhost/nhost-js";
import type { Session, Strain, ToleranceBreak } from "../types/db-types";

// Input types that mimic the database requirements minus generated fields
export interface CreateSessionInput {
  created_by: string;
  strain_used: string;
  usage_method: string;
  amount: number;
  notes?: string | null;
  effects?: string[] | null;
}

export interface CreateStrainInput {
  name: string;
  thc_content: number;
  cbd_content: number;
  description: string;
  is_public: boolean;
  created_by: string;
  img_path: string;
}

export interface CreateBreakInput {
  user_id: string;
  start_date: string;
  end_date?: string | null;
  goal_days?: number | null;
  break_type: "intentional" | "passive";
}

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

const INSERT_STRAIN_MUTATION = `
mutation InsertStrains($name: String!, $thc_content: Int!, $cbd_content: Int!, $description: String!, $is_public: Boolean!, $created_by: uuid!, $img_path: String!) {
  insert_strains_one(object: {
    name: $name, 
    thc_content: $thc_content, 
    cbd_content: $cbd_content, 
    description: $description, 
    is_public: $is_public, 
    created_by: $created_by, 
    img_path: $img_path
  }) {
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

export async function createSession(
  nhost: NhostClient,
  input: CreateSessionInput
): Promise<Session> {
  const response = await nhost.graphql.request({
    query: INSERT_SESSION_MUTATION,
    variables: input,
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    throw new Error(errors[0]?.message || "GraphQL Error");
  }

  if (!data?.insert_sessions_one) {
    throw new Error("Failed to create session - no data returned");
  }

  return data.insert_sessions_one;
}

export async function createStrain(
  nhost: NhostClient,
  input: CreateStrainInput
): Promise<Strain> {
  const response = await nhost.graphql.request({
    query: INSERT_STRAIN_MUTATION,
    variables: input,
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    throw new Error(errors[0]?.message || "GraphQL Error");
  }

  if (!data?.insert_strains_one) {
    throw new Error("Failed to create strain - no data returned");
  }

  return data.insert_strains_one;
}

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
