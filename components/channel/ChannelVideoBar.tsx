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
      <p className="font-geist font-semibold text-[18px] text-white">Conteúdo</p>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="bg-[#191919] border border-[#3e3e3e] rounded-[6px]
                        px-3 py-2 flex items-center gap-2 min-w-[227px]">
          <Search size={16} className="text-[#a1a1a1] shrink-0" />
          <span className="font-geist font-medium text-[14px] text-[#a1a1a1]">
            Buscar lives...
          </span>
        </div>

        {/* Filtros */}
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-[10px] rounded-[6px]
                        font-geist font-bold text-[14px] transition-colors
                        ${active === id
                          ? 'bg-[#fdff79] text-[#0c0c0c]'
                          : 'bg-[#262626] text-white hover:bg-[#333]'
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
