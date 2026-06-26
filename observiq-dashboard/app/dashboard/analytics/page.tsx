'use client'

import { useState, useEffect } from 'react'
import {
  getAnalyticsByModel,
  getAnalyticsByFeature, 
  getAnalyticsDaily
} from '@/lib/api'
import type {
  ModelAnalytics,
  FeatureAnalytics,
  DailyAnalytics
} from '@/lib/types'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#FFFFFF', '#D4D4D4', '#8A8A8A', '#C7C7C7', '#F8FAFC']

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-dark border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted mb-1">{label}</p>
      {payload.map((item: any, index: number) => (
        <p key={index} className="text-ivory">
          {item.name}: {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [modelData, setModelData] = useState<ModelAnalytics[]>([])
  const [featureData, setFeatureData] = useState<FeatureAnalytics[]>([])
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const key = localStorage.getItem('oiq_api_key')
    setApiKey(key)

    if (!key) {
      setIsLoading(false)
      return
    }

    Promise.all([
      getAnalyticsByModel(key),
      getAnalyticsByFeature(key),
      getAnalyticsDaily(key)
    ])
      .then(([models, features, daily]) => {
        setModelData(models)
        setFeatureData(features)
        setDailyData(daily)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-in space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ivory">Analytics</h1>
        <p className="text-soft text-sm mt-1">Detailed performance breakdown and insights</p>
      </div>

      {/* Analytics by Model */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-ivory mb-6">Analytics by Model</h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Model Usage Chart */}
          <div>
            <h3 className="text-sm font-medium text-soft mb-4">Call Volume by Model</h3>
            {modelData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted">
                No model data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={modelData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis 
                    dataKey="model" 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="call_count" 
                    name="Calls"
                    fill="#FFFFFF" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Model Cost Distribution */}
          <div>
            <h3 className="text-sm font-medium text-soft mb-4">Cost Distribution</h3>
            {modelData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted">
                No model data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={modelData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ model, percent }: any) => `${model} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_cost_usd"
                  >
                    {modelData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Model Performance Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark/60 border-b border-border">
              <tr>
                {['Model', 'Calls', 'Avg Latency', 'Total Cost', 'Success Rate'].map((header) => (
                  <th
                    key={header}
                    className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {modelData.map((model, i) => (
                <tr key={i} className="hover:bg-border/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-ivory font-medium">{model.model}</td>
                  <td className="px-4 py-3 text-sm text-soft">{model.call_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-soft">{model.avg_latency_ms}ms</td>
                  <td className="px-4 py-3 text-sm text-soft font-mono">${model.total_cost_usd.toFixed(6)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${model.success_rate >= 90 ? 'text-primary' : 'text-accent'}`}>
                      {model.success_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics by Feature */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-ivory mb-6">Analytics by Feature</h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Feature Usage Chart */}
          <div>
            <h3 className="text-sm font-medium text-soft mb-4">Feature Call Volume</h3>
            {featureData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted">
                No feature data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={featureData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="feature_name" 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="call_count" 
                    name="Calls"
                    fill="#D4D4D4" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Feature Latency Comparison */}
          <div>
            <h3 className="text-sm font-medium text-soft mb-4">Average Latency by Feature</h3>
            {featureData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted">
                No feature data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={featureData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis 
                    dataKey="feature_name" 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="avg_latency_ms" 
                    name="Avg Latency (ms)"
                    stroke="#FFFFFF" 
                    strokeWidth={2}
                    dot={{ fill: '#FFFFFF', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Feature Performance Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark/60 border-b border-border">
              <tr>
                {['Feature', 'Calls', 'Avg Latency', 'Total Cost', 'Success Rate'].map((header) => (
                  <th
                    key={header}
                    className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {featureData.map((feature, i) => (
                <tr key={i} className="hover:bg-border/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-ivory font-medium">{feature.feature_name}</td>
                  <td className="px-4 py-3 text-sm text-soft">{feature.call_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-soft">{feature.avg_latency_ms}ms</td>
                  <td className="px-4 py-3 text-sm text-soft font-mono">${feature.total_cost_usd.toFixed(6)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${feature.success_rate >= 90 ? 'text-primary' : 'text-accent'}`}>
                      {feature.success_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily Analytics */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-ivory mb-6">Daily Analytics</h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Call Volume */}
          <div>
            <h3 className="text-sm font-medium text-soft mb-4">Daily Call Volume</h3>
            {dailyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted">
                No daily data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="call_count"
                    name="Calls"
                    stroke="#FFFFFF"
                    fill="#FFFFFF"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Daily Cost Trend */}
          <div>
            <h3 className="text-sm font-medium text-soft mb-4">Daily Cost Trend</h3>
            {dailyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted">
                No daily data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="total_cost_usd" 
                    name="Cost (USD)"
                    stroke="#D4D4D4" 
                    strokeWidth={2}
                    dot={{ fill: '#D4D4D4', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily Error Tracking */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-soft mb-4">Daily Error Tracking</h3>
          {dailyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted">
              No daily data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#8A8A8A', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="error_count" 
                  name="Errors"
                  fill="#C7C7C7" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  )
}
