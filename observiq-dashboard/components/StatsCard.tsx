import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accentColor: 'green' | 'yellow'
}

export default function StatsCard({ label, value, icon: Icon, accentColor }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 
                    hover:border-primary/30 hover:-translate-y-0.5 
                    transition-all duration-200 cursor-default relative overflow-hidden group">
      
      {/* Icon */}
      <div className="absolute top-4 right-4">
        <Icon className="w-5 h-5 text-primary/40" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted font-medium">
          {label}
        </p>
        <p className="text-4xl font-bold text-ivory leading-none animate-count-up">
          {value}
        </p>
      </div>

      {/* Accent bar */}
      <div className={`
        absolute bottom-0 left-0 h-0.5 w-full rounded-full
        ${accentColor === 'green' ? 'bg-primary' : 'bg-accent'}
      `} />
    </div>
  )
}
