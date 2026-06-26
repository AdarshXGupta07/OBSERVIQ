export default function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      <span className="text-xs text-primary font-medium">Live</span>
    </div>
  )
}
