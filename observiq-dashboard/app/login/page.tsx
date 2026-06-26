'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getTeam } from '@/lib/api'

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmed = apiKey.trim()
    if (!trimmed) {
      setError('Please enter your API key')
      return
    }

    if (!trimmed.startsWith('oiq_')) {
      setError('API key must start with oiq_')
      return
    }

    setLoading(true)
    setError('')

    try {
      const team = await getTeam(trimmed)
      localStorage.setItem('oiq_api_key', trimmed)
      localStorage.setItem('oiq_team', JSON.stringify(team))
      router.push('/dashboard')
    } catch {
      setError('Invalid API key. Please check and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark p-4 text-ivory">
      <div className="w-full max-w-md animate-in">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card text-base font-bold">
            OQ
          </div>
          <div>
            <p className="text-lg font-bold leading-none">ObservIQ</p>
            <p className="mt-1 text-xs text-muted">AI observability</p>
          </div>
        </Link>

        <div className="rounded-lg border border-border bg-card p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-ivory">Login</h1>
          <p className="mt-2 text-sm leading-6 text-soft">
            Use your ObservIQ API key to open the dashboard for your team.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="apiKey" className="mb-2 block text-sm font-medium text-soft">
                API key
              </label>
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="oiq_..."
                className="w-full rounded-lg border border-border bg-dark px-4 py-3 font-mono text-sm text-ivory outline-none transition-colors placeholder:text-muted focus:border-ivory"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-border bg-dark px-4 py-3 text-sm text-ivory">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ivory px-4 py-3 text-sm font-semibold text-dark transition-colors hover:bg-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Need an API key?{' '}
            <Link href="/signup" className="font-medium text-ivory hover:text-soft">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
