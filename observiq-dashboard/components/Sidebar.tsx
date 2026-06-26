'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Activity, TrendingUp, AlertTriangle, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Team } from '@/lib/types'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/traces', label: 'Traces', icon: Activity },
  { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/dashboard/anomalies', label: 'Anomalies', icon: AlertTriangle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [team, setTeam] = useState<Team | null>(null)

  useEffect(() => {
    const savedTeam = localStorage.getItem('oiq_team')
    if (savedTeam) {
      try {
        setTeam(JSON.parse(savedTeam))
      } catch {}
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('oiq_api_key')
    localStorage.removeItem('oiq_team')
    router.push('/login')
  }

  return (
    <aside className="w-[260px] h-screen bg-dark border-r border-border flex flex-col sticky top-0">
      
      {/* Logo section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <span className="text-xl font-bold text-primary">OQ</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">ObservIQ</h1>
            <p className="text-xs tracking-widest text-muted">SINCE 2026</p>
          </div>
        </div>
      </div>

      {/* Nav section */}
      <nav className="flex-1 mt-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-primary/10 text-ivory border-l-4 border-primary pl-3'
                  : 'text-muted hover:text-soft hover:bg-card'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border space-y-3">
        {team && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-soft truncate">{team.name}</p>
            <div className="inline-block bg-accent/20 text-accent text-xs font-semibold px-2 py-0.5 rounded">
              {team.plan.toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted hover:text-danger transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
