'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Settings, LogIn, Bell, ChevronRight, User, Cog, LogOut, Palette, Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  isLoggedIn?: boolean
  user?: { name: string; avatar?: string }
}

export default function Header({ isLoggedIn = false, user }: HeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 rounded-full bg-vod overflow-hidden relative focus:outline-none ring-offset-surface focus:ring-2 focus:ring-accent"
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user?.name ?? 'Avatar'}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                ) : (
                  <div className="w-full h-full bg-vod" />
                )}
              </button>

              {menuOpen && (
                <div className="absolute top-[44px] right-0 w-[220px] bg-surface-secondary border border-vod rounded-lg py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-50">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-secondary text-base hover:bg-surface-elevated transition-colors">
                    <Palette size={16} className="text-muted shrink-0" />
                    <span>Tema</span>
                    <ChevronRight size={12} className="text-muted ml-auto" />
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-secondary text-base hover:bg-surface-elevated transition-colors">
                    <Globe size={16} className="text-muted shrink-0" />
                    <span>Idioma</span>
                    <ChevronRight size={12} className="text-muted ml-auto" />
                  </button>
                  <div className="h-px bg-vod-subtle mx-2 my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); router.push('/profile') }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-secondary text-base hover:bg-surface-elevated transition-colors"
                  >
                    <User size={16} className="text-muted shrink-0" />
                    <span>Seu Perfil</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); router.push('/settings') }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-secondary text-base hover:bg-surface-elevated transition-colors"
                  >
                    <Cog size={16} className="text-muted shrink-0" />
                    <span>Configurações</span>
                  </button>
                  <div className="h-px bg-vod-subtle mx-2 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 text-base hover:bg-surface-elevated transition-colors"
                  >
                    <LogOut size={16} className="text-red-400 shrink-0" />
                    <span>Sair</span>
                  </button>
                </div>
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
