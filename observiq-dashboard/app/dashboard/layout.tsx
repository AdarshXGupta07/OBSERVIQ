'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const apiKey = localStorage.getItem('oiq_api_key')
    if (!apiKey) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex flex-row h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-dark">
        {children}
      </main>
    </div>
  )
}
