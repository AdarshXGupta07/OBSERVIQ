'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { Activity, CheckCircle, Clock, DollarSign, LayoutGrid, ServerCog } from 'lucide-react'
import { useTraces } from '@/hooks/useTraces'
import {
  getAnalyticsByFeature,
  getAnalyticsByModel,
  getAnalyticsDaily,
  getAnalyticsOverview
} from '@/lib/api'
import type {
  AnalyticsOverview,
  DailyAnalytics,
  FeatureAnalytics,
  ModelAnalytics
} from '@/lib/types'
import StatsCard from '@/components/StatsCard'
import TracesTable from '@/components/TracesTable'
import LiveBadge from '@/components/LiveBadge'

const GRID = '#242424'
const AXIS = '#8A8A8A'
const WHITE = '#FFFFFF'
const SOFT = '#D4D4D4'

function formatUsd(value = 0, digits = 4) {
  return `$${Number(value || 0).toFixed(digits)}`
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-lg border border-border bg-card text-sm text-muted">
      {label}
    </div>
  )
}

function Panel({
  title,
  caption,
  children,
  className = ''
}: {
  title: string
  caption?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-lg border border-border bg-card ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-ivory">{title}</h2>
          {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function DashboardTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-dark px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-muted">{label}</p>
      {payload.map((item: any) => (
        <p key={item.dataKey} className="text-ivory">
          {item.name}: {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
        </p>
      ))}
    </div>
  )
}

export default function OverviewPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [stats, setStats] = useState<AnalyticsOverview | null>(null)
  const [daily, setDaily] = useState<DailyAnalytics[]>([])
  const [byModel, setByModel] = useState<ModelAnalytics[]>([])
  const [byFeature, setByFeature] = useState<FeatureAnalytics[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const { traces, newTraceIds, isLoading, lastUpdated } = useTraces(apiKey)

  useEffect(() => {
    const key = localStorage.getItem('oiq_api_key')
    setApiKey(key)

    if (!key) {
      setAnalyticsLoading(false)
      return
    }

    Promise.all([
      getAnalyticsOverview(key),
      getAnalyticsDaily(key),
      getAnalyticsByModel(key),
      getAnalyticsByFeature(key)
    ])
      .then(([overview, dailyData, modelData, featureData]) => {
        setStats(overview)
        setDaily(dailyData)
        setByModel(modelData)
        setByFeature(featureData)
      })
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false))
  }, [])

  const recentTraces = traces.slice(0, 10)
  const topModel = byModel[0]
  const topFeature = byFeature[0]

  const dailyTotals = useMemo(() => {
    return daily.reduce(
      (acc, day) => ({
        calls: acc.calls + day.call_count,
        cost: acc.cost + day.total_cost_usd,
        errors: acc.errors + day.error_count
      }),
      { calls: 0, cost: 0, errors: 0 }
    )
  }, [daily])

  const latencyBands = useMemo(() => {
    const fast = traces.filter((trace) => trace.latency_ms < 500).length
    const steady = traces.filter((trace) => trace.latency_ms >= 500 && trace.latency_ms < 2000).length
    const slow = traces.filter((trace) => trace.latency_ms >= 2000).length
    return [
      { label: '<500ms', calls: fast },
      { label: '500ms-2s', calls: steady },
      { label: '>2s', calls: slow }
    ]
  }, [traces])

  return (
    <div className="animate-in p-8">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">Command center</p>
          <h1 className="text-2xl font-bold text-ivory">Overview</h1>
          <p className="mt-1 text-sm text-soft">Live AI usage, cost, reliability, and feature performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge />
          {lastUpdated && (
            <span className="text-xs text-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total AI Calls"
          value={stats?.total_calls?.toLocaleString() || '0'}
          icon={LayoutGrid}
          accentColor="green"
        />
        <StatsCard
          label="Avg Latency"
          value={stats ? `${stats.avg_latency_ms}ms` : '-'}
          icon={Clock}
          accentColor="yellow"
        />
        <StatsCard
          label="Total Cost"
          value={stats ? formatUsd(stats.total_cost_usd) : '-'}
          icon={DollarSign}
          accentColor="green"
        />
        <StatsCard
          label="Success Rate"
          value={stats ? `${stats.success_rate}%` : '-'}
          icon={CheckCircle}
          accentColor="yellow"
        />
      </div>

      <div className="mb-8 grid gap-5 xl:grid-cols-3">
        <Panel
          title="Daily Activity"
          caption={`${dailyTotals.calls.toLocaleString()} calls and ${formatUsd(dailyTotals.cost)} over the last 7 days`}
          className="xl:col-span-2"
        >
          {analyticsLoading ? (
            <EmptyPanel label="Loading daily analytics..." />
          ) : daily.length === 0 ? (
            <EmptyPanel label="No daily analytics yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={daily}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<DashboardTooltip />} />
                <Area
                  type="monotone"
                  dataKey="call_count"
                  name="Calls"
                  stroke={WHITE}
                  fill={WHITE}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Reliability" caption={`${dailyTotals.errors.toLocaleString()} errors in the last 7 days`}>
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">Error Count</p>
              <p className="mt-2 text-4xl font-bold text-ivory">{stats?.error_count ?? 0}</p>
            </div>
            <div className="h-px bg-border" />
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={daily}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: AXIS, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<DashboardTooltip />} />
                <Line
                  type="monotone"
                  dataKey="error_count"
                  name="Errors"
                  stroke={SOFT}
                  strokeWidth={2}
                  dot={{ fill: WHITE, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mb-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Model Usage" caption={topModel ? `Top model: ${topModel.model}` : 'No model data yet'}>
          {byModel.length === 0 ? (
            <EmptyPanel label="No model analytics yet" />
          ) : (
            <div className="space-y-5">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byModel.slice(0, 6)} layout="vertical">
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="model"
                    tick={{ fill: AXIS, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={118}
                  />
                  <Tooltip content={<DashboardTooltip />} />
                  <Bar dataKey="call_count" name="Calls" fill={WHITE} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-dark p-3">
                  <p className="text-xs text-muted">Calls</p>
                  <p className="mt-1 text-lg font-semibold text-ivory">{topModel?.call_count.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-lg border border-border bg-dark p-3">
                  <p className="text-xs text-muted">Avg Latency</p>
                  <p className="mt-1 text-lg font-semibold text-ivory">{topModel?.avg_latency_ms || 0}ms</p>
                </div>
                <div className="rounded-lg border border-border bg-dark p-3">
                  <p className="text-xs text-muted">Cost</p>
                  <p className="mt-1 text-lg font-semibold text-ivory">{formatUsd(topModel?.total_cost_usd, 6)}</p>
                </div>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Feature Performance" caption={topFeature ? `Highest spend: ${topFeature.feature_name}` : 'No feature data yet'}>
          {byFeature.length === 0 ? (
            <EmptyPanel label="No feature analytics yet" />
          ) : (
            <div className="space-y-4">
              {byFeature.slice(0, 5).map((feature) => {
                const maxCalls = Math.max(...byFeature.map((item) => item.call_count), 1)
                const width = Math.max((feature.call_count / maxCalls) * 100, 4)

                return (
                  <div key={feature.feature_name}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="truncate font-medium text-ivory">{feature.feature_name}</span>
                      <span className="text-muted">{feature.call_count.toLocaleString()} calls</span>
                    </div>
                    <div className="h-2 rounded-full bg-dark">
                      <div className="h-2 rounded-full bg-ivory" style={{ width: `${width}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>{feature.avg_latency_ms}ms avg</span>
                      <span>{formatUsd(feature.total_cost_usd, 6)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>

      <div className="mb-8 grid gap-5 xl:grid-cols-3">
        <Panel title="Latency Bands" caption="Distribution from the latest trace window">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={latencyBands}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<DashboardTooltip />} />
              <Bar dataKey="calls" name="Calls" fill={WHITE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Cost Efficiency" caption="Spend per call from overview and weekly analytics">
          <div className="grid h-full content-center gap-4">
            <div className="rounded-lg border border-border bg-dark p-4">
              <p className="text-xs uppercase tracking-widest text-muted">All-time cost per call</p>
              <p className="mt-2 text-3xl font-bold text-ivory">
                {formatUsd((stats?.total_cost_usd || 0) / Math.max(stats?.total_calls || 0, 1), 6)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-dark p-4">
              <p className="text-xs uppercase tracking-widest text-muted">7-day cost per call</p>
              <p className="mt-2 text-3xl font-bold text-ivory">
                {formatUsd(dailyTotals.cost / Math.max(dailyTotals.calls, 1), 6)}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="System Mix" caption="Quick read from current analytics">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-dark p-4">
              <ServerCog className="h-5 w-5 text-ivory" />
              <div>
                <p className="text-sm font-medium text-ivory">{byModel.length || 0} models observed</p>
                <p className="text-xs text-muted">Across all captured traces</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-dark p-4">
              <Activity className="h-5 w-5 text-ivory" />
              <div>
                <p className="text-sm font-medium text-ivory">{byFeature.length || 0} active features</p>
                <p className="text-xs text-muted">Grouped by feature name</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-dark p-4">
              <p className="text-xs uppercase tracking-widest text-muted">Best success rate</p>
              <p className="mt-2 text-xl font-semibold text-ivory">
                {byModel.length ? `${Math.max(...byModel.map((item) => item.success_rate))}%` : '0%'}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ivory">Recent Traces</h2>
            <p className="mt-1 text-xs text-muted">Latest requests flowing through ObservIQ.</p>
          </div>
          <Link
            href="/dashboard/traces"
            className="text-xs font-medium text-soft transition-colors hover:text-ivory"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
            Loading traces...
          </div>
        ) : (
          <div className="p-5">
            <TracesTable traces={recentTraces} newTraceIds={newTraceIds} />
          </div>
        )}
      </section>
    </div>
  )
}
