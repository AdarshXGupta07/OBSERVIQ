import Link from 'next/link'

export default function PageShell({ title, subtitle, action, children }) {
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 1200 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 28
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: '#64748b' }}>{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

export function Section({ title, subtitle, action, children }) {
  return (
    <div style={{
      background: '#0f1117', border: '1px solid #1e2130',
      borderRadius: 12, padding: '1.5rem', marginBottom: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', marginBottom: 2 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: '#64748b' }}>{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.href} style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none' }}>
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

export function StatCard({ label, value }) {
  return (
    <div style={{
      background: '#0f1117', border: '1px solid #1e2130',
      borderRadius: 12, padding: '1.5rem',
    }}>
      <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 600, color: '#e2e8f0', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}

export function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
        border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : '#1e2130'}`,
        color: active ? '#6366f1' : '#64748b',
        padding: '6px 14px', borderRadius: 8, fontSize: 12,
        cursor: 'pointer', fontWeight: active ? 500 : 400,
        transition: 'all 0.15s'
      }}
    >
      {children}
    </button>
  )
}