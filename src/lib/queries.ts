import type { Session, Strain } from "../types/db-types";
import nhost, { authUtils } from "./nhost";

export async function getUserSessions(): Promise<Session[]> {
  const currentUser = authUtils.getUserId();

  if (!currentUser) {
    return [];
  }

  const GET_USER_SESSIONS_QUERY = `query GetUserSessions ($userId: uuid!){
      sessions(where: {created_by: {_eq: $userId}}, order_by: {created_at: desc}) {
        session_id
        created_by
        amount
        created_at
        usage_method
        strain_used
        effects
        notes
      }
    }`;

  const response = await nhost.graphql.request({
    query: GET_USER_SESSIONS_QUERY,
    variables: { userId: currentUser },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return [];
  }

  const sessions = data?.sessions || [];

  return sessions;
}

export async function getUserStrains(): Promise<Strain[]> {
  const currentUser = authUtils.getUserId();

  if (!currentUser) {
    return [];
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

  const response = await nhost.graphql.request({
    query: GET_USER_STRAINS_QUERY,
    variables: { userId: currentUser },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return [];
  }

  const strains = data?.strains || [];

  return strains;

  // Convert THC/CBD content to percentages
  // return strains.map((strain: Strain) => ({
  //   ...strain,
  //   thc_content: strain.thc_content / 10,
  //   cbd_content: strain.cbd_content / 10,
  // }));
}

export async function getStrainById(strainId: string): Promise<Strain | null> {
  const currentUser = authUtils.getUserId();
  if (!strainId) {
    console.error("Strain ID is required");
    return null;
  }

  if (!currentUser) {
    return null;
  }

  const GET_STRAIN_QUERY = `
  query GetStrainById($id: uuid!) {
    strains_by_pk(id: $id) {
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

  const response = await nhost.graphql.request({
    query: GET_STRAIN_QUERY,
    variables: { id: strainId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const strain = data?.strains_by_pk || null;

  return strain;
}
