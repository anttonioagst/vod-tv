import { ReactNode } from 'react'

interface PageHeaderProps {
  icon: ReactNode
  title: string
  subtitle: string
}

export default function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-surface-secondary border border-vod rounded-lg flex items-center gap-4 p-4 mb-4 w-full">
      <div className="w-10 h-10 flex items-center justify-center shrink-0 text-accent">
        {icon}
      </div>
      <div className="flex flex-col leading-normal">
        <p className="font-medium text-base text-white">{title}</p>
        <p
          className="font-normal text-base text-muted"
          style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}
