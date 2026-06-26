interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isSuccess = status === 'success'
  
  return (
    <span className={`
      text-xs font-semibold px-2.5 py-1 rounded-md inline-block
      ${isSuccess
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'bg-danger/10 text-danger border border-danger/20'
      }
    `}>
      {status}
    </span>
  )
}
