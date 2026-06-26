'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Copy, Loader2 } from 'lucide-react'
import { registerTeam } from '@/lib/api'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setError('Please enter your team name')
      return
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const team = await registerTeam(trimmedName, trimmedEmail)
      setApiKey(team.api_key)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your team')
    } finally {
      setLoading(false)
    }
  }

  async function copyApiKey() {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function continueToLogin() {
    router.push('/login')
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
          {apiKey ? (
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-dark">
                <Check className="h-5 w-5 text-ivory" />
              </div>
              <h1 className="text-2xl font-bold text-ivory">Your team is ready</h1>
              <p className="mt-2 text-sm leading-6 text-soft">
                Save this API key now. It is used to connect your SDK and log in to the dashboard.
              </p>

              <div className="mt-6 rounded-lg border border-border bg-dark p-4">
                <code className="break-all font-mono text-sm text-ivory">{apiKey}</code>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={copyApiKey}
                  className="flex items-center justify-center gap-2 rounded-lg bg-ivory px-4 py-3 text-sm font-semibold text-dark transition-colors hover:bg-soft"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy API key'}
                </button>
                <button
                  type="button"
                  onClick={continueToLogin}
                  className="rounded-lg border border-border px-4 py-3 text-sm font-semibold text-ivory transition-colors hover:border-ivory"
                >
                  Continue to login
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-ivory">Create your account</h1>
              <p className="mt-2 text-sm leading-6 text-soft">
                Create a team, receive an API key, and start sending AI traces to ObservIQ.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="teamName" className="mb-2 block text-sm font-medium text-soft">
                    Team name
                  </label>
                  <input
                    id="teamName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-lg border border-border bg-dark px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-muted focus:border-ivory"
                    placeholder="Acme AI"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-soft">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-border bg-dark px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-muted focus:border-ivory"
                    placeholder="you@company.com"
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
                  {loading ? 'Creating team...' : 'Create team'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                Already have an API key?{' '}
                <Link href="/login" className="font-medium text-ivory hover:text-soft">
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
