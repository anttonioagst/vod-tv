interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle: string
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[400px] text-center px-4">
      <div className="w-16 h-16 flex items-center justify-center text-muted">
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <p className="text-base font-medium text-muted">{subtitle}</p>
      </div>
    </div>
  )
}
