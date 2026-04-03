'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import SvgIcon from '@/components/ui/SvgIcon'

const URL_ERROR_MESSAGES: Record<string, string> = {
  auth: 'Não foi possível entrar. Tente novamente.',
  no_code: 'Houve um problema com a autenticação. Tente novamente.',
}

interface LoginCardProps {
  urlError?: string
  className?: string
}

export default function LoginCard({ urlError, className }: LoginCardProps) {
  const [loading, setLoading] = useState<'google' | 'twitch' | null>(null)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const urlErrorMessage = urlError && !bannerDismissed ? URL_ERROR_MESSAGES[urlError] : null

  async function handleOAuth(provider: 'google' | 'twitch') {
    setLoading(provider)
    setOauthError(null)
    setBannerDismissed(true)
    try {
      const supabase = createClient()
      const redirectTo = process.env.NODE_ENV === 'production'
        ? 'https://vod-tv.vercel.app/auth/callback'
        : 'http://localhost:3000/auth/callback'
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })
      if (error) {
        setOauthError('Erro ao entrar. Tente novamente.')
        setLoading(null)
      }
    } catch {
      setOauthError('Erro ao entrar. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div className={`flex flex-col gap-[10px] items-center justify-center overflow-clip px-[171px] py-[74px]${className ? ` ${className}` : ''}`}>
      {/* Bloco superior: logo + textos */}
      <div className="flex flex-col gap-[12px] items-center pb-[32px]">
        <div className="w-[237px] h-[170px] bg-surface-secondary rounded-2xl flex items-center justify-center">
          <Image src="/icons/vod-logo.svg" alt="Vod TV" width={138} height={96} className="object-contain" />
        </div>
        <div className="flex flex-col items-center">
          <p className="font-bold text-[24px] text-white pb-[8px] text-center">
            Bem Vindo à Vod TV!
          </p>
          <p className="font-medium text-[16px] text-muted pb-[8px] text-center">
            Faça login para continuar
          </p>
        </div>
      </div>

      {/* Banner de erro da URL (vindo do callback) */}
      {urlErrorMessage && (
        <div className="w-[351px] bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-red-300 text-base">{urlErrorMessage}</span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-muted hover:text-secondary transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Erro do OAuth client-side */}
      {oauthError && (
        <p className="text-red-300 text-sm text-center w-[351px]">{oauthError}</p>
      )}

      {/* Botões OAuth */}
      <div className="flex flex-col gap-[12px] items-center w-[351px]">
        <button
          onClick={() => handleOAuth('google')}
          disabled={loading !== null}
          className="w-full bg-surface-secondary border border-vod rounded-sm py-[11px] px-[100px] flex items-center justify-center gap-[10px] hover:border-accent transition-colors duration-150 ease-out disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <SvgIcon src="/icons/google.svg" size={16} />
          <span className="font-semibold text-base text-white">
            {loading === 'google' ? 'Redirecionando...' : 'Entrar com Google'}
          </span>
        </button>

        <button
          onClick={() => handleOAuth('twitch')}
          disabled={loading !== null}
          className="w-full bg-surface-secondary border border-vod rounded-sm py-[11px] px-[100px] flex items-center justify-center gap-[10px] hover:border-twitch transition-colors duration-150 ease-out disabled:opacity-50 text-twitch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-twitch/50"
        >
          <SvgIcon src="/icons/twitch.svg" size={16} />
          <span className="font-semibold text-base text-white">
            {loading === 'twitch' ? 'Redirecionando...' : 'Entrar com Twitch'}
          </span>
        </button>
      </div>
    </div>
  )
}
