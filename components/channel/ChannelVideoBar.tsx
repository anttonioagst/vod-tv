'use client'
import { useState } from 'react'
import { Search, ArrowDown, ArrowUp, Eye, ThumbsUp } from 'lucide-react'

const FILTERS = [
  { id: 'recent', label: 'Mais recentes', icon: ArrowDown },
  { id: 'oldest', label: 'Mais antigos', icon: ArrowUp },
  { id: 'watched', label: 'Mais vistos', icon: Eye },
  { id: 'liked', label: 'Mais curtidos', icon: ThumbsUp },
]

export default function ChannelVideoBar() {
  const [active, setActive] = useState('recent')

  return (
    <div className="flex items-center justify-between py-4">
      <p className="font-primary font-semibold text-[18px] text-primary">Conteúdo</p>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="bg-surface-secondary border border-vod rounded-sm
                        px-3 py-2 flex items-center gap-2 min-w-[227px]">
          <Search size={16} className="text-subtle shrink-0" />
          <span className="font-primary font-medium text-[14px] text-subtle">
            Buscar lives...
          </span>
        </div>

        {/* Filtros */}
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-[10px] rounded-sm
                        font-primary font-bold text-[14px] transition-colors
                        ${active === id
                          ? 'bg-accent text-accent-fg'
                          : 'bg-surface-elevated text-primary hover:bg-vod'
                        }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
