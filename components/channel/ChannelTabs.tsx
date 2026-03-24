'use client'
import { useState } from 'react'

const TABS = ['Vídeos', 'Gratuito', 'Playlists', 'Sobre']

interface ChannelTabsProps {
  defaultTab?: string
  onTabChange?: (tab: string) => void
}

export default function ChannelTabs({ defaultTab = 'Vídeos', onTabChange }: ChannelTabsProps) {
  const [active, setActive] = useState(defaultTab)

  const handleTab = (tab: string) => {
    setActive(tab)
    onTabChange?.(tab)
  }

  return (
    <div className="flex gap-1 border-b border-[#3e3e3e]">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTab(tab)}
          className={`p-4 font-geist font-medium text-[14px] transition-colors
                      ${active === tab
                        ? 'text-white border-b-2 border-white -mb-px'
                        : 'text-[#737373] border-b border-[#737373] -mb-px'
                      }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
