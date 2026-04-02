import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  // Captura erros retornados pelo provider OAuth ou pelo Supabase
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  if (oauthError) {
    console.error('[auth/callback] OAuth error:', oauthError, oauthErrorDescription)
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  if (!code) {
    console.error('[auth/callback] No code in URL. Params:', Object.fromEntries(searchParams))
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
