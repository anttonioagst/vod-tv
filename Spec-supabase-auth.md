# Spec — Supabase Auth (Google + Twitch)

## Estado Atual (confirmado via leitura de código)

| Arquivo | Status | Observação |
|---------|--------|------------|
| `components/auth/LoginCard.tsx` | Existe | Botões com `console.log()` — sem OAuth real |
| `app/(auth)/layout.tsx` | Existe | Renderiza `<>{children}</>` — sem proteção |
| `components/layout/Header.tsx` | Existe | `'use client'`, recebe `isLoggedIn` e `user` como props estáticas |
| `components/layout/AppShell.tsx` | Existe | Repassa `isLoggedIn`/`user` para Header e Sidebar |
| `app/(public)/login/page.tsx` | Existe | Renderiza `LoginCard` dentro de `AppShell` |
| `middleware.ts` | **NÃO existe** | Criar na raiz |
| `lib/supabase/` | **NÃO existe** | Criar diretório e arquivos |
| `app/auth/callback/route.ts` | **NÃO existe** | Criar handler OAuth |

---

## Pré-requisitos Manuais (fora do código)

> Estes passos precisam ser feitos **antes** de rodar qualquer código.

### 1. Habilitar providers no Dashboard Supabase

Projeto: `lyplbunxjertktddusug`

1. Acesse: Authentication > Providers
2. **Google:** ativar, inserir Client ID e Client Secret do Google Cloud Console
3. **Twitch:** ativar, inserir Client ID e Client Secret do Twitch Developer Console
4. Redirect URI a registrar em ambos os providers:
   ```
   https://lyplbunxjertktddusug.supabase.co/auth/v1/callback
   ```

### 2. Adicionar variáveis de ambiente

Arquivo: `.env.local` (adicionar ao existente — não sobrescrever `SUPABASE_ACCESS_TOKEN`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://lyplbunxjertktddusug.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_do_dashboard>
```

> A `ANON_KEY` está em: Dashboard > Settings > API > Project API keys > `anon public`

---

## Dependências

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Arquivos a Criar

### 1. `lib/supabase/client.ts`

Client para componentes `'use client'`. Exporta uma função que cria (ou reutiliza) o cliente browser.

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Onde é usado:** `LoginCard.tsx`

---

### 2. `lib/supabase/server.ts`

Client para Server Components e Route Handlers. Usa `cookies()` do Next.js para persistência de sessão.

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies só podem ser definidos em Route Handlers/Middleware
          }
        },
      },
    }
  )
}
```

**Onde é usado:** `app/(auth)/layout.tsx`, `app/auth/callback/route.ts`

---

### 3. `middleware.ts` (raiz do projeto, ao lado de `next.config.ts`)

Responsável por:
- Refresh automático do token JWT em toda requisição
- Proteção de rotas `/(auth)/*`: redireciona para `/login` se não autenticado
- Redireciona `/login` para `/home` se já autenticado

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: usar getUser() — nunca getSession() para validação
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rota autenticada sem usuário → /login
  if (!user && pathname.startsWith('/home') && !pathname.startsWith('/auth')) {
    // Cobre rotas do grupo (auth) que resolvem para /home, /subscriptions, etc.
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // /login com usuário já autenticado → /home
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

> **Nota sobre pathname:** O App Router resolve os grupos de rota — `app/(auth)/home/page.tsx` serve a URL `/home`, não `/(auth)/home`. O matcher de proteção deve usar os paths reais da URL.

**Rotas protegidas (pathname real → arquivo):**

| URL | Arquivo |
|-----|---------|
| `/home` | `app/(auth)/home/page.tsx` |
| `/subscriptions` | `app/(auth)/subscriptions/page.tsx` |
| `/following` | `app/(auth)/following/page.tsx` |
| `/history` | `app/(auth)/history/page.tsx` |
| `/watch-later` | `app/(auth)/watch-later/page.tsx` |
| `/liked` | `app/(auth)/liked/page.tsx` |
| `/referrals` | `app/(auth)/referrals/page.tsx` |
| `/affiliates` | `app/(auth)/affiliates/page.tsx` |

O matcher do middleware deve cobrir esses paths. Sugestão de lista explícita no `config.matcher` para precisão:

```ts
export const config = {
  matcher: [
    '/home',
    '/subscriptions',
    '/following',
    '/history',
    '/watch-later',
    '/liked',
    '/referrals',
    '/affiliates/:path*',
    '/login',
    '/auth/:path*',
  ],
}
```

---

### 4. `app/auth/callback/route.ts`

Route Handler GET. Troca o `code` por sessão e redireciona.

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/home`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

---

## Arquivos a Modificar

### 5. `components/auth/LoginCard.tsx`

**Mudanças:**
- Adicionar `'use client'` (já existe)
- Importar `createClient` de `@/lib/supabase/client`
- Instanciar o client fora dos handlers (singleton no módulo)
- Substituir os `console.log()` por `signInWithOAuth`
- Adicionar estado de loading para desabilitar botões durante redirecionamento

**Trecho atual a substituir (linhas 48–67):**
```tsx
// onClick={() => console.log('Google OAuth — implementar com NextAuth')}
// onClick={() => console.log('Twitch OAuth — implementar com NextAuth')}
```

**Implementação:**
```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

// ... ícones mantidos igual ...

export default function LoginCard() {
  const [loading, setLoading] = useState<'google' | 'twitch' | null>(null)

  async function handleOAuth(provider: 'google' | 'twitch') {
    setLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    // Não resetar loading — a página vai redirecionar
  }

  return (
    // ... estrutura mantida igual ...
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
    // ...
  )
}
```

---

### 6. `app/(auth)/layout.tsx`

**Mudanças:**
- Tornar `async` (Server Component — sem `'use client'`)
- Buscar sessão server-side
- Redirecionar para `/login` se não autenticado
- Passar `user` para `AppShell`

**Implementação completa:**
```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const appUser = {
    name: user.user_metadata?.full_name ?? user.email ?? 'Usuário',
    avatar: user.user_metadata?.avatar_url ?? undefined,
  }

  return (
    <AppShell isLoggedIn activePath={undefined} user={appUser}>
      {children}
    </AppShell>
  )
}
```

> **Importante:** As páginas dentro de `(auth)` devem parar de renderizar o próprio `AppShell` — o layout já o provê. Verificar cada `page.tsx` de `(auth)` para remover `AppShell` duplicado após esta mudança.

---

### 7. `components/layout/Header.tsx`

O `Header` já recebe `isLoggedIn` e `user` como props — a interface não muda. A origem dos dados muda de estática para real, via `app/(auth)/layout.tsx` que agora passa o user do Supabase.

**Nenhuma mudança necessária no componente em si.**

A única adição opcional é um botão de logout:

```tsx
// Adicionar na seção isLoggedIn, ao lado do avatar
<button
  onClick={async () => {
    const supabase = createClient() // do @/lib/supabase/client
    await supabase.auth.signOut()
    router.push('/login')
  }}
  className="..."
>
  Sair
</button>
```

> Isso é opcional e pode ser implementado depois sem bloquear o fluxo principal.

---

## Fluxo Completo

```
[LoginCard] clica "Entrar com Google"
      │
      ▼
supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })
      │
      ▼
Browser → Google OAuth consent screen
      │
      ▼
Google → GET /auth/callback?code=<CODE>
      │
      ▼
[app/auth/callback/route.ts]
  exchangeCodeForSession(code)
  → cookie de sessão gravado
  → redirect('/home')
      │
      ▼
[middleware.ts]
  getUser() → usuário presente → deixa passar
      │
      ▼
[app/(auth)/layout.tsx]
  getUser() → user presente
  → renderiza AppShell com isLoggedIn=true e user.avatar
      │
      ▼
[Header] mostra avatar do usuário logado
```

---

## Ordem de Implementação

1. [ ] **Pré-requisito:** habilitar Google e Twitch no Dashboard Supabase
2. [ ] **Pré-requisito:** adicionar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local`
3. [ ] `npm install @supabase/supabase-js @supabase/ssr`
4. [ ] Criar `lib/supabase/client.ts`
5. [ ] Criar `lib/supabase/server.ts`
6. [ ] Criar `app/auth/callback/route.ts`
7. [ ] Criar `middleware.ts`
8. [ ] Modificar `components/auth/LoginCard.tsx`
9. [ ] Modificar `app/(auth)/layout.tsx`
10. [ ] Verificar páginas `(auth)/*.tsx` — remover `AppShell` duplicado se houver
11. [ ] Testar fluxo completo localmente

---

## Pontos de Atenção

| Ponto | Detalhe |
|-------|---------|
| `getUser()` vs `getSession()` | Sempre usar `getUser()` no middleware e layouts — faz chamada ao servidor Auth e valida o token. `getSession()` lê apenas o cookie local e não é seguro para proteção de rota. |
| `NEXT_PUBLIC_ANON_KEY` | É pública por design — segurança é garantida via RLS no Supabase, não pela chave. |
| `service_role` key | Nunca usar no frontend ou middleware. Apenas em scripts server-side confiáveis. |
| Páginas `(auth)` com AppShell próprio | Após o layout passar o AppShell, remover instâncias duplicadas nas pages para evitar double-render. |
| `activePath` no layout | O layout `(auth)` não tem acesso ao pathname diretamente. Usar `usePathname()` em um Client Component wrapper se necessário, ou deixar `undefined` por ora. |
| Cookies em Server Components | O `try/catch` em `setAll` do `server.ts` é intencional — Server Components não podem setar cookies, apenas Route Handlers e Middleware podem. |
