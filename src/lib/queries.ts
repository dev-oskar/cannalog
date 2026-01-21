import type { Session, Strain } from "../types/db-types";
import { formatTimeSince } from "./utils";
import type { NhostClient } from "@nhost/nhost-js";

export async function getUserSessions(
  nhost: NhostClient,
  userId: string,
): Promise<Session[]> {
  if (!userId) {
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
    variables: { userId: userId },
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

export async function getSessionById(
  nhost: NhostClient,
  sessionId: string,
): Promise<Session | null> {
  if (!sessionId) {
    console.error("Session ID is required");
    return null;
  }

  const GET_SESSION_QUERY = `query GetSessionById($sessionId: uuid!) {
    sessions(where: {session_id: {_eq: $sessionId}}, limit: 1) {
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
    query: GET_SESSION_QUERY,
    variables: { sessionId: sessionId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const sessions = data?.sessions || [];
  const session = sessions.length > 0 ? sessions[0] : null;

  return session;
}

export async function getUserStrains(
  nhost: NhostClient,
  userId: string,
): Promise<Strain[]> {
  if (!userId) {
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
    variables: { userId: userId },
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

export async function getStrainById(
  nhost: NhostClient,
  strainId: string,
): Promise<Strain | null> {
  if (!strainId) {
    console.error("Strain ID is required");
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

export async function getTimeSinceLastSession(
  nhost: NhostClient,
  lang: string,
): Promise<string | null> {
  const GET_TIME_SINCE_LAST_SESS = `query GetLastSessionTime {
  sessions(
    limit: 1,
    order_by: {created_at: desc}
  ) {
    created_at
  }
}`;

  const response = await nhost.graphql.request({
    query: GET_TIME_SINCE_LAST_SESS,
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  if (Array.isArray(data.sessions) && data.sessions.length === 0) {
    return null; // No sessions found
  }

  return formatTimeSince(data.sessions[0].created_at, lang);
}

export async function getUserStatsOverview(
  nhost: NhostClient,
  userId: string,
): Promise<{ totalSessions: number; totalAmount: number } | null> {
  if (!userId) {
    return null;
  }

  const GET_USER_STATS_OVERVIEW_QUERY = `
    query GetUserStatsOverview($userId: uuid!) {
      sessions_aggregate(where: { created_by: { _eq: $userId } }) {
        aggregate {
          count
          sum {
            amount
          }
        }
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_USER_STATS_OVERVIEW_QUERY,
    variables: { userId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const aggregate = data?.sessions_aggregate?.aggregate;
  if (!aggregate) {
    return { totalSessions: 0, totalAmount: 0 };
  }

  return {
    totalSessions: aggregate.count || 0,
    totalAmount: aggregate.sum?.amount || 0,
  };
}

export async function getFavoriteStrain(
  nhost: NhostClient,
  userId: string,
): Promise<{ strain: string; count: number } | null> {
  if (!userId) {
    return null;
  }

  const GET_USER_SESSIONS_FOR_STRAINS_QUERY = `
    query GetUserSessionsForStrains($userId: uuid!) {
      sessions(where: { created_by: { _eq: $userId } }) {
        strain_used
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_USER_SESSIONS_FOR_STRAINS_QUERY,
    variables: { userId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const sessions = data?.sessions || [];
  if (sessions.length === 0) {
    return null;
  }

  // Group by strain_used and count
  const strainCounts: Record<string, number> = {};
  sessions.forEach((session: any) => {
    const strain = session.strain_used || "Unknown";
    strainCounts[strain] = (strainCounts[strain] || 0) + 1;
  });

  // Find the max
  let maxStrain = "";
  let maxCount = 0;
  for (const [strain, count] of Object.entries(strainCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxStrain = strain;
    }
  }

  return { strain: maxStrain, count: maxCount };
}

export async function getWeeklyUsage(
  nhost: NhostClient,
  userId: string,
): Promise<{ sessions: number; amount: number } | null> {
  if (!userId) {
    return null;
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const GET_WEEKLY_USAGE_QUERY = `
    query GetWeeklyUsage($userId: uuid!, $startDate: timestamptz!) {
      sessions_aggregate(where: { created_by: { _eq: $userId }, created_at: { _gte: $startDate } }) {
        aggregate {
          count
          sum {
            amount
          }
        }
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_WEEKLY_USAGE_QUERY,
    variables: { userId, startDate: weekAgo.toISOString() },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const aggregate = data?.sessions_aggregate?.aggregate;
  return {
    sessions: aggregate?.count || 0,
    amount: aggregate?.sum?.amount || 0,
  };
}

export async function getMonthlyUsage(
  nhost: NhostClient,
  userId: string,
): Promise<{ sessions: number; amount: number } | null> {
  if (!userId) {
    return null;
  }

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const GET_MONTHLY_USAGE_QUERY = `
    query GetMonthlyUsage($userId: uuid!, $startDate: timestamptz!) {
      sessions_aggregate(where: { created_by: { _eq: $userId }, created_at: { _gte: $startDate } }) {
        aggregate {
          count
          sum {
            amount
          }
        }
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_MONTHLY_USAGE_QUERY,
    variables: { userId, startDate: monthAgo.toISOString() },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const aggregate = data?.sessions_aggregate?.aggregate;
  return {
    sessions: aggregate?.count || 0,
    amount: aggregate?.sum?.amount || 0,
  };
}

export async function getUsageMethodDistribution(
  nhost: NhostClient,
  userId: string,
): Promise<Record<string, number> | null> {
  if (!userId) {
    return null;
  }

  const GET_USAGE_METHODS_QUERY = `
    query GetUsageMethods($userId: uuid!) {
      sessions(where: { created_by: { _eq: $userId } }) {
        usage_method
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_USAGE_METHODS_QUERY,
    variables: { userId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const sessions = data?.sessions || [];
  const methodCounts: Record<string, number> = {};
  sessions.forEach((session: any) => {
    const method = session.usage_method || "Other";
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });

  return methodCounts;
}

export async function getEffectsSummary(
  nhost: NhostClient,
  userId: string,
): Promise<Record<string, number> | null> {
  if (!userId) {
    return null;
  }

  const GET_EFFECTS_QUERY = `
    query GetEffects($userId: uuid!) {
      sessions(where: { created_by: { _eq: $userId } }) {
        effects
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_EFFECTS_QUERY,
    variables: { userId },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const sessions = data?.sessions || [];
  const effectCounts: Record<string, number> = {};
  sessions.forEach((session: any) => {
    const effects = session.effects || "None";
    effectCounts[effects] = (effectCounts[effects] || 0) + 1;
  });

  return effectCounts;
}

export async function getMonthlyTrend(
  nhost: NhostClient,
  userId: string,
  year: number = new Date().getFullYear(),
): Promise<Array<{ month: number; sessions: number; amount: number }> | null> {
  if (!userId) {
    return null;
  }

  const startOfYear = new Date(year, 0, 1).toISOString();
  const endOfYear = new Date(year + 1, 0, 1).toISOString();

  const GET_YEARLY_SESSIONS_QUERY = `
    query GetYearlySessions($userId: uuid!, $start: timestamptz!, $end: timestamptz!) {
      sessions(where: { created_by: { _eq: $userId }, created_at: { _gte: $start, _lt: $end } }) {
        created_at
        amount
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_YEARLY_SESSIONS_QUERY,
    variables: { userId, start: startOfYear, end: endOfYear },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return null;
  }

  const sessions = data?.sessions || [];
  const monthlyData: Array<{
    month: number;
    sessions: number;
    amount: number;
  }> = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    sessions: 0,
    amount: 0,
  }));

  sessions.forEach((session: any) => {
    const date = new Date(session.created_at);
    const month = date.getMonth(); // 0-based
    monthlyData[month].sessions += 1;
    monthlyData[month].amount += session.amount || 0;
  });

  return monthlyData;
}

export async function getStrainsAddedLastDays(
  nhost: NhostClient,
  userId: string,
  days: number = 30,
): Promise<number> {
  if (!userId) {
    return 0;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const GET_STRAINS_QUERY = `
    query GetStrainsAddedLastDays($userId: uuid!, $startDate: timestamptz!) {
      strains(where: { created_by: { _eq: $userId }, created_at: { _gte: $startDate } }) {
        id
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_STRAINS_QUERY,
    variables: { userId, startDate: startDate.toISOString() },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return 0;
  }

  const strains = data?.strains || [];
  return strains.length;
}

export async function getStrainsAddedDailyLast30Days(
  nhost: NhostClient,
  userId: string,
): Promise<Array<{ day: string; count: number }>> {
  if (!userId) {
    return [];
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const GET_STRAINS_QUERY = `
    query GetStrainsLast30Days($userId: uuid!, $startDate: timestamptz!) {
      strains(where: { created_by: { _eq: $userId }, created_at: { _gte: $startDate } }, order_by: { created_at: asc }) {
        created_at
      }
    }
  `;

  const response = await nhost.graphql.request({
    query: GET_STRAINS_QUERY,
    variables: { userId, startDate: startDate.toISOString() },
  });

  const data = (response as any).body?.data;
  const errors = (response as any).body?.errors;

  if (errors) {
    console.error("GraphQL Error:", errors);
    return [];
  }

  const strains = data?.strains || [];

  // Group by day
  const dayCounts: Record<string, number> = {};
  const today = new Date();

  // Initialize all 30 days with 0
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split("T")[0];
    dayCounts[dayKey] = 0;
  }

  // Count strains by day
  strains.forEach((strain: any) => {
    const date = new Date(strain.created_at);
    const dayKey = date.toISOString().split("T")[0];
    if (dayKey in dayCounts) {
      dayCounts[dayKey]++;
    }
  });

  // Convert to array sorted by date
  const result = Object.entries(dayCounts)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([day, count]) => ({ day, count }));

  return result;
}
