'use client'

import { useState } from 'react'
import { verifyApiKey } from '../lib/api'

export default function LoginScreen({ onLoginSuccess, onGoToRegister }) {
  const [key, setKey]         = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    const trimmed = key.trim()

    if (!trimmed) {
      setError('Please enter your API key.')
      return
    }

    if (!trimmed.startsWith('oiq_')) {
      setError('API key must start with oiq_')
      return
    }

    setLoading(true)
    setError('')

    try {
      const team = await verifyApiKey(trimmed)

      if (!team) {
        setError('Invalid API key. Please check and try again.')
        setLoading(false)
        return
      }

      onLoginSuccess(trimmed, team)

    } catch {
      setError('Cannot connect to server. Is it running on port 8000?')
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>ObservIQ</h1>
        <p className="subtitle">AI Application Monitoring</p>

        <input
          type="text"
          className="api-input"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Enter your API key (oiq_...)"
          autoComplete="off"
          spellCheck={false}
        />

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect →'}
        </button>

        {error && <p className="error-msg">{error}</p>}

        <button className="back-link" onClick={onGoToRegister}>
          No account? Create one →
        </button>
      </div>
    </div>
  )
}