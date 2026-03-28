# PRD — Supabase Auth (Google + Twitch)

## 1. Estado Atual do Projeto

### O que existe

| Item | Status | Detalhe |
|------|--------|---------|
| `app/(public)/login/page.tsx` | Existe | Renderiza `LoginCard` dentro do `AppShell` |
| `components/auth/LoginCard.tsx` | Existe | Botões Google e Twitch com `console.log()` — sem implementação |
| `app/(auth)/layout.tsx` | Existe | Layout vazio — **sem proteção de rota** |
| `components/layout/` | Existe | AppShell, Header, Sidebar com prop `isLoggedIn` (estático) |
| `lib/types.ts` | Existe | Tipos `User`, `Video`, `Channel` — sem integração Supabase |
| `lib/mock-data.ts` | Existe | Dados mock — sem queries reais |
| `middleware.ts` | **NÃO existe** | Necessário para refresh de sessão + proteção |
| `lib/supabase/` | **NÃO existe** | Necessário para clients server/client |
| `app/auth/callback/` | **NÃO existe** | Route handler do OAuth necessário |

### .env.local atual
```
SUPABASE_ACCESS_TOKEN=sbp_...   # token MCP — NÃO é usado pelo app
```
Faltam as variáveis do cliente Supabase.

### package.json — dependências
Não há nenhum pacote `@supabase/*` instalado:
- Falta: `@supabase/supabase-js`
- Falta: `@supabase/ssr`

### Banco Supabase (`lyplbunxjertktddusug`)
- **Status:** ACTIVE_HEALTHY (us-west-2, PostgreSQL 17.6)
- **Schema `auth`:** habilitado com todas as tabelas padrão (`users`, `sessions`, `identities`, `flow_state`, etc.)
- **Schema `public`:** vazio — nenhuma tabela de negócio criada ainda
- **OAuth providers configurados:** nenhum — `auth.custom_oauth_providers` está vazia
- **Configuração Google/Twitch:** pendente no Dashboard do Supabase

---

## 2. Providers Necessários

### Google OAuth
- Provider nativo do Supabase Auth
- Requer: `Client ID` + `Client Secret` do Google Cloud Console
- Scopes mínimos: `email`, `profile`
- Redirect URI a registrar: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

### Twitch OAuth
- Provider nativo do Supabase Auth
- Requer: `Client ID` + `Client Secret` do Twitch Developer Console
- Scopes mínimos: `user:read:email`
- Redirect URI a registrar: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

> **Importante:** Os providers são habilitados no Dashboard do Supabase em
> Authentication > Providers > Google / Twitch.
> O código Next.js não precisa saber das credenciais OAuth — só do Supabase URL e Anon Key.

---

## 3. Variáveis de Ambiente Necessárias

```env
# .env.local — adicionar ao arquivo existente

# Supabase cliente (públicas — prefixo NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=https://lyplbunxjertktddusug.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_do_dashboard>

# Já existe — manter
SUPABASE_ACCESS_TOKEN=sbp_...
```

A `ANON_KEY` é obtida no Dashboard: Settings > API > Project API keys > `anon public`.

---

## 4. Arquivos a Criar / Modificar

### 4.1 Instalar dependências
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 4.2 Criar: `lib/supabase/server.ts`
Client para Server Components, Route Handlers e Middleware.
Usa `createServerClient` do `@supabase/ssr` com cookies do Next.js.

### 4.3 Criar: `lib/supabase/client.ts`
Client para Client Components (`'use client'`).
Usa `createBrowserClient` do `@supabase/ssr`.

### 4.4 Criar: `middleware.ts` (raiz do projeto)
- Intercepta todas as rotas
- Chama `supabase.auth.getUser()` para refresh automático do token
- Protege rotas `/(auth)/*`: redireciona para `/login` se não autenticado
- Redireciona `/login` para `/(auth)/home` se já autenticado
- Matcher: todas as rotas exceto `_next/static`, `_next/image`, `favicon.ico`

### 4.5 Criar: `app/auth/callback/route.ts`
Route Handler GET que:
1. Lê o `code` da query string (`?code=...`)
2. Troca o `code` por sessão via `supabase.auth.exchangeCodeForSession(code)`
3. Redireciona para `/(auth)/home` em caso de sucesso
4. Redireciona para `/login?error=auth` em caso de falha

### 4.6 Modificar: `components/auth/LoginCard.tsx`
Substituir os `console.log()` por chamadas reais:
```ts
const supabase = createBrowserClient(...)
await supabase.auth.signInWithOAuth({
  provider: 'google', // ou 'twitch'
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

### 4.7 Modificar: `app/(auth)/layout.tsx`
Adicionar verificação de sessão server-side.
Se não autenticado → `redirect('/login')`.
Se autenticado → passar `user` para o `AppShell` via props/context.

### 4.8 Modificar: `.env.local`
Adicionar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 5. Fluxo de Autenticação

```
Usuário clica "Entrar com Google/Twitch" (LoginCard)
        │
        ▼
LoginCard chama supabase.auth.signInWithOAuth({ provider })
        │
        ▼
Browser redireciona → Google/Twitch consent screen
        │
        ▼
Google/Twitch retorna → /auth/callback?code=<CODE>
        │
        ▼
app/auth/callback/route.ts
  └── exchangeCodeForSession(code)  →  sessão gravada nos cookies
        │
        ▼
redirect('/home')  →  app/(auth)/home/page.tsx
        │
        ▼
middleware.ts verifica getUser() em toda requisição subsequente
  ├── autenticado   → deixa passar
  └── não autenticado → redirect('/login')
```

---

## 6. Arquitetura dos Clients Supabase

```
@supabase/ssr
├── createServerClient(url, key, { cookies })
│   ├── lib/supabase/server.ts       → Server Components
│   ├── app/auth/callback/route.ts   → Route Handler
│   └── middleware.ts                → Middleware
│
└── createBrowserClient(url, key)
    └── lib/supabase/client.ts       → 'use client' components
```

> **Por que `@supabase/ssr` e não `@supabase/supabase-js` direto?**
> O `@supabase/ssr` gerencia automaticamente o refresh do token via cookies
> entre Server Components, Client Components e Middleware — requisito do Next.js App Router.

---

## 7. Ordem de Implementação

1. [ ] Habilitar providers Google e Twitch no Dashboard Supabase
2. [ ] Adicionar vars de ambiente ao `.env.local`
3. [ ] `npm install @supabase/supabase-js @supabase/ssr`
4. [ ] Criar `lib/supabase/server.ts`
5. [ ] Criar `lib/supabase/client.ts`
6. [ ] Criar `app/auth/callback/route.ts`
7. [ ] Criar `middleware.ts`
8. [ ] Modificar `components/auth/LoginCard.tsx`
9. [ ] Modificar `app/(auth)/layout.tsx`
10. [ ] Testar fluxo completo localmente

---

## 8. Considerações de Segurança

- O `NEXT_PUBLIC_SUPABASE_ANON_KEY` é público por design — protege via RLS no Supabase
- Nunca expor a `service_role` key no frontend ou no middleware
- O middleware deve usar `getUser()` (chamada ao servidor Auth) — **nunca** `getSession()` para validar autenticação, pois `getSession()` lê apenas o cookie sem verificar com o servidor
- Configurar RLS nas tabelas `public` antes de expor dados reais
