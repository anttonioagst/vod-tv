'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Settings, LogIn, Bell } from 'lucide-react'

interface HeaderProps {
  isLoggedIn?: boolean
  user?: { name: string; avatar?: string }
}

export default function Header({ isLoggedIn = false, user }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="h-[56px] bg-surface border-b border-vod flex items-center justify-between px-[10px] shrink-0">
      {/* Search Bar */}
      <div className="flex w-[568px] h-[42px] opacity-[0.67] focus-within:opacity-100 transition-opacity">
        <input
          type="text"
          placeholder="Pesquisar"
          className="flex-1 h-full bg-surface-secondary border border-vod border-r-0 rounded-l-sm px-3 text-base font-medium text-white placeholder:text-vod focus:outline-none"
        />
        <button className="bg-surface-elevated border border-vod border-l-0 rounded-r-sm px-6 flex items-center justify-center">
          <Search size={16} className="text-vod" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-vod transition-colors">
              <Bell size={16} className="text-secondary" />
            </button>
            <div className="w-8 h-8 rounded-full bg-vod overflow-hidden relative">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <div className="w-full h-full bg-vod" />
              )}
            </div>
          </>
        ) : (
          <>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-vod transition-colors">
              <Settings size={16} className="text-secondary" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 bg-accent text-accent-fg rounded-sm px-[17px] py-[9px] text-base font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.06)] hover:brightness-95 transition-all"
            >
              <LogIn size={16} />
              <span>Entrar</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
