'use client'

import { useState } from 'react'
import { registerTeam } from '../lib/api'

export default function RegisterScreen({ onBackToLogin }) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey]   = useState(null)   // success state
  const [copied, setCopied]   = useState(false)

  async function handleRegister() {
    const trimmedName  = name.trim()
    const trimmedEmail = email.trim()

    // Validation
    if (!trimmedName) {
      setError('Team name is required.')
      return
    }

    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }

    // Basic email format check
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // POST /teams/register → { name, email }
      const team = await registerTeam(trimmedName, trimmedEmail)
      setApiKey(team.api_key)

    } catch (err) {
      // Backend 400 → "Email already registered."
      setError(err.message || 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Success screen — API key dikhao ──
  if (apiKey) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="success-icon">✓</div>
          <h1>You're in!</h1>
          <p className="subtitle">
            Save your API key now — it won't be shown again.
          </p>

          <div className="apikey-box">
            <code className="apikey-text">{apiKey}</code>
          </div>

          <button
            className="login-btn copy-btn"
            onClick={handleCopy}
          >
            {copied ? '✓ Copied!' : 'Copy API Key'}
          </button>

          <button className="back-link" onClick={onBackToLogin}>
            Go to Login →
          </button>
        </div>
      </div>
    )
  }

  // ── Register form ──
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>ObservIQ</h1>
        <p className="subtitle">Create your team</p>

        <input
          type="text"
          className="api-input"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRegister()}
          placeholder="Team name (e.g. My Startup)"
          autoComplete="off"
        />

        <input
          type="email"
          className="api-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRegister()}
          placeholder="Email (e.g. dev@mystartup.com)"
          autoComplete="off"
        />

        <button
          className="login-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Team →'}
        </button>

        {error && <p className="error-msg">{error}</p>}

        <button className="back-link" onClick={onBackToLogin}>
          ← Back to Login
        </button>
      </div>
    </div>
  )
}