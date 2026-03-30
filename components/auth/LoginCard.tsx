'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function TwitchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9146FF">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
    </svg>
  )
}

export default function LoginCard() {
  const [loading, setLoading] = useState<'google' | 'twitch' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleOAuth(provider: 'google' | 'twitch') {
    setLoading(provider)
    setError(null)
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
        setError('Erro ao entrar. Tente novamente.')
        setLoading(null)
      }
      // Sem erro: página vai redirecionar, não resetar loading
    } catch {
      setError('Erro ao entrar. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-[10px] items-center justify-center px-[171px] py-[74px]">
      {/* Bloco superior: logo + textos */}
      <div className="flex flex-col gap-[12px] items-center pb-[32px]">
        {/* Logo placeholder */}
        <div className="w-[237px] h-[170px] bg-white rounded-[16px] flex items-center justify-center">
          <span className="font-bold text-[32px] text-black">
            VOD<span className="text-[16px] align-super">TV</span>
          </span>
        </div>

        {/* Textos */}
        <div className="flex flex-col items-center">
          <p className="font-bold text-[24px] text-white pb-[8px] text-center">
            Bem Vindo à Vod TV!
          </p>
          <p className="font-medium text-[16px] text-muted pb-[8px] text-center">
            Faça login para continuar
          </p>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-red-400 text-sm text-center w-[351px]">{error}</p>
      )}

      {/* Botões OAuth */}
      <div className="flex flex-col gap-[12px] items-center w-[351px]">
        {/* Google */}
        <button
          onClick={() => handleOAuth('google')}
          disabled={loading !== null}
          className="w-full bg-surface-secondary border border-vod rounded-sm py-[11px] px-[100px] flex items-center justify-center gap-[10px] hover:border-accent transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          <span className="font-semibold text-base text-white">
            {loading === 'google' ? 'Redirecionando...' : 'Entrar com Google'}
          </span>
        </button>

        {/* Twitch */}
        <button
          onClick={() => handleOAuth('twitch')}
          disabled={loading !== null}
          className="w-full bg-surface-secondary border border-vod rounded-sm py-[11px] px-[100px] flex items-center justify-center gap-[10px] hover:border-[#9146FF] transition-colors disabled:opacity-50"
        >
          <TwitchIcon />
          <span className="font-semibold text-base text-white">
            {loading === 'twitch' ? 'Redirecionando...' : 'Entrar com Twitch'}
          </span>
        </button>
      </div>
    </div>
  )
}
