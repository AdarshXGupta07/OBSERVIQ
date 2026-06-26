import {
  DailyAnalytics,
  AnalyticsOverview,
  FeatureAnalytics,
  ModelAnalytics,
  RegisteredTeam,
  Team,
  TracesResponse
} from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getTeam(apiKey: string): Promise<Team> {
  const res = await fetch(`${BASE}/teams/me`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!res.ok) throw new Error('Invalid API key')
  return res.json()
}

export async function registerTeam(name: string, email: string): Promise<RegisteredTeam> {
  const res = await fetch(`${BASE}/teams/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.detail || 'Failed to create team')
  }

  return res.json()
}

export async function getTraces(
  apiKey: string,
  page = 1,
  limit = 50
): Promise<TracesResponse> {
  const res = await fetch(`${BASE}/traces?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!res.ok) throw new Error('Failed to fetch traces')
  return res.json()
}

export async function getAnalyticsOverview(apiKey: string): Promise<AnalyticsOverview> {
  const res = await fetch(`${BASE}/analytics/overview`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

export async function getAnalyticsByModel(apiKey: string): Promise<ModelAnalytics[]> {
  const res = await fetch(`${BASE}/analytics/by-model`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!res.ok) throw new Error('Failed to fetch model analytics')
  return res.json()
}

export async function getAnalyticsByFeature(apiKey: string): Promise<FeatureAnalytics[]> {
  const res = await fetch(`${BASE}/analytics/by-feature`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!res.ok) throw new Error('Failed to fetch feature analytics')
  return res.json()
}

export async function getAnalyticsDaily(apiKey: string): Promise<DailyAnalytics[]> {
  const res = await fetch(`${BASE}/analytics/daily`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!res.ok) throw new Error('Failed to fetch daily analytics')
  return res.json()
}
