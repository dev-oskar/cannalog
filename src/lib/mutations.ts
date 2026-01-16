import type { NhostClient } from "@nhost/nhost-js";
import type { Session, Strain } from "../types/db-types";

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
