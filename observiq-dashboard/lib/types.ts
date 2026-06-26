export interface Team {
  id: string
  name: string
  email: string
  api_key_prefix: string
  plan: string
  created_at: string
}

export interface RegisteredTeam extends Team {
  api_key: string
  message: string
}

export interface Trace {
  id: string
  team_id: string
  model: string
  input: string | null
  output: string | null
  prompt_tokens: number
  completion_tokens: number
  latency_ms: number
  cost_usd: number
  status: string
  error_message: string | null
  feature_name: string | null
  user_identifier: string | null
  created_at: string
}

export interface TracesResponse {
  traces: Trace[]
  total: number
  page: number
  limit: number
}

export interface AnalyticsOverview {
  total_calls: number
  avg_latency_ms: number
  total_cost_usd: number
  success_rate: number
  error_count: number
}

export interface ModelAnalytics {
  model: string
  call_count: number
  avg_latency_ms: number
  total_cost_usd: number
  success_rate: number
}

export interface FeatureAnalytics {
  feature_name: string
  call_count: number
  avg_latency_ms: number
  total_cost_usd: number
  success_rate: number
}

export interface DailyAnalytics {
  date: string
  label: string
  call_count: number
  total_cost_usd: number
  avg_latency_ms: number
  error_count: number
}
