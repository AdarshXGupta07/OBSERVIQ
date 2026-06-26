'use client'

import Link from 'next/link'
import { Activity, BarChart3, CheckCircle2, KeyRound, ShieldCheck, TerminalSquare } from 'lucide-react'

const steps = [
  {
    title: 'Create a team',
    text: 'Sign up once, copy your API key, and keep it with your application secrets.'
  },
  {
    title: 'Send traces',
    text: 'Use the ObservIQ SDK around your AI calls to capture latency, tokens, cost, status, model, and feature names.'
  },
  {
    title: 'Monitor the dashboard',
    text: 'Open the dashboard to review usage trends, model cost, feature activity, reliability, and recent traces.'
  }
]

const capabilities = [
  'AI request tracing',
  'Model and feature analytics',
  'Cost and latency monitoring',
  'Daily usage trends'
]

export default function Home() {
  return (
    <main className="min-h-screen bg-dark text-ivory">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold">
              OQ
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">ObservIQ</p>
              <p className="mt-1 text-xs text-muted">AI observability</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <a
              href="https://observiq-docs.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-soft transition-colors hover:border-ivory hover:text-ivory"
            >
              Read Docs
            </a>
            <Link
              href="/login"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-soft transition-colors hover:border-ivory hover:text-ivory"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-ivory px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-soft"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
              Monitor AI products with clarity
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ivory md:text-6xl">
              Professional observability for every AI call in your application.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-soft">
              ObservIQ helps teams understand how their AI features behave in production: what models are used,
              how much they cost, where latency appears, and whether requests are succeeding.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-ivory px-5 py-3 text-sm font-semibold text-dark transition-colors hover:bg-soft"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:border-ivory"
              >
                Login with API key
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-semibold text-ivory">Live dashboard preview</p>
                <p className="mt-1 text-xs text-muted">Usage, quality, and cost in one view</p>
              </div>
              <div className="rounded-full border border-border px-3 py-1 text-xs text-soft">Live</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Total calls', '24,918'],
                ['Avg latency', '612ms'],
                ['Success rate', '99.1%'],
                ['Total cost', '$42.83']
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-dark p-4">
                  <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
                  <p className="mt-3 text-2xl font-bold text-ivory">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {[
                ['chat-completions', 'llama-3.3-70b', '$0.0048'],
                ['support-summary', 'gpt-4o-mini', '$0.0016'],
                ['invoice-parser', 'claude-sonnet', '$0.0061']
              ].map(([feature, model, cost]) => (
                <div key={feature} className="grid grid-cols-[1fr_auto_auto] gap-4 rounded-lg border border-border bg-dark px-4 py-3 text-sm">
                  <span className="truncate text-ivory">{feature}</span>
                  <span className="hidden text-muted sm:inline">{model}</span>
                  <span className="font-mono text-soft">{cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-4">
          {capabilities.map((item, index) => {
            const icons = [Activity, BarChart3, ShieldCheck, CheckCircle2]
            const Icon = icons[index]
            return (
              <div key={item} className="rounded-lg border border-border bg-card p-5">
                <Icon className="mb-4 h-5 w-5 text-ivory" />
                <p className="text-sm font-semibold text-ivory">{item}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">How to use it</p>
            <h2 className="mt-3 text-3xl font-bold text-ivory">From API key to production insight.</h2>
            <p className="mt-4 text-sm leading-6 text-soft">
              ObservIQ is built for teams shipping AI-backed features. Add the SDK where calls happen,
              then use the dashboard to review the operational picture without digging through logs.
            </p>
          </div>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-[48px_1fr]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-dark text-sm font-bold text-ivory">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-ivory">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-soft">{step.text}</p>
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-dark p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ivory">
                <TerminalSquare className="h-4 w-4" />
                SDK usage pattern
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 text-xs leading-6 text-soft">
{`client = ObservIQ(api_key="oiq_...")

with client.trace(model="gpt-4o-mini", feature_name="support-summary"):
    response = call_your_ai_model()`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <span>ObservIQ gives AI teams a clean operational view of their model traffic.</span>
          <div className="flex items-center gap-4">
            <a href="https://observiq-docs.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-ivory">Docs</a>
            <Link href="/login" className="hover:text-ivory">Login</Link>
            <Link href="/signup" className="hover:text-ivory">Sign up</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
