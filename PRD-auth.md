# PRD-auth.md — Levantamento Completo para Implementação das Rotas (auth)/

> Gerado em: 2026-03-25
> Baseado em: leitura direta de todos os arquivos em `components/` e `app/`

---

## 1. Estado do componente Header

**Arquivo:** `components/layout/Header.tsx`

**Sim — já suporta estado logado/não-logado via prop `isLoggedIn`.**

| Estado | O que renderiza |
|--------|----------------|
| `isLoggedIn={false}` | Ícone Settings + botão "Entrar" (accent, redireciona `/login`) |
| `isLoggedIn={true}` | Ícone Bell (notificações) + Avatar circular (32px) com `user.avatar` |

**Props aceitas:**
```ts
interface HeaderProps {
  isLoggedIn?: boolean
  user?: { name: string; avatar?: string }
}
```

**Gaps no Header:**
- Bell sem badge de contador de notificações
- Avatar sem dropdown de menu do usuário (logout, perfil, configurações)
- Settings (modo deslogado) sem funcionalidade
- Search sem debounce/integração com API

---

## 2. Middleware de autenticação

**Não existe `middleware.ts`.**

- Nenhuma lógica de sessão configurada
- NextAuth **não está instalado** (sem `next-auth` em package.json)
- O botão Google/Twitch no `LoginCard` tem apenas `console.log`
- A prop `isLoggedIn` é **passada manualmente** como flag estática em cada página
- As rotas `(auth)/` são **completamente abertas** — sem proteção alguma

**O que falta para auth funcionar:**
1. Instalar `next-auth` (ou alternativa: `lucia`, `better-auth`)
2. Criar `app/api/auth/[...nextauth]/route.ts`
3. Criar `middleware.ts` na raiz protegendo `/(auth)/**`
4. Criar `app/(auth)/layout.tsx` com guard de sessão
5. Conectar `user` real ao `AppShell` via `session`

---

## 3. Estado das rotas (auth)/

**Todas as pastas existem mas estão completamente vazias (só `.gitkeep`).**

| Rota | Pasta | Figma nodeId | `page.tsx` | `layout.tsx` |
|------|-------|-------------|-----------|-------------|
| Home logado | `app/(auth)/home/` | `94:1583` | ❌ | ❌ |
| Assinaturas | `app/(auth)/subscriptions/` | `94:2621` | ❌ | ❌ |
| Seguindo | `app/(auth)/following/` | `96:827` | ❌ | ❌ |
| Histórico | `app/(auth)/history/` | `97:1025` | ❌ | ❌ |
| Assistir mais tarde | `app/(auth)/watch-later/` | `101:1255` | ❌ | ❌ |
| Vídeos curtidos | `app/(auth)/liked/` | `102:1413` | ❌ | ❌ |
| Indicações | `app/(auth)/referrals/` | `102:1569` | ❌ | ❌ |
| Afiliados | `app/(auth)/affiliates/` | `109:2287` | ❌ | ❌ |
| Afiliados/Aplicar | `app/(auth)/affiliates/apply/` | `113:3564` | ❌ | ❌ |

Também não existe `app/(auth)/layout.tsx` (layout compartilhado do grupo).

---

## 4. Sidebar e item ativo dinâmico

**Arquivo:** `components/layout/Sidebar.tsx`

**Sim — já suporta item ativo via prop `activePath`.**

```tsx
const isActive = activePath === item.href
// aplica: bg-vod quando ativo
```

- A prop flui: `AppShell(activePath)` → `Sidebar(activePath)` → `NavLink(activePath)`
- Seções "Você" e "Comunidade" aparecem **somente se `isLoggedIn={true}`**
- Nas rotas `(auth)/` basta passar `isLoggedIn={true}` e `activePath="/rota"` ao `AppShell`

**Gaps na Sidebar:**
- `activePath` é string estática — para highlight automático precisaria de `usePathname()`
- Os links das seções "Você" e "Comunidade" apontam para rotas que ainda não existem

---

## 5. Componentes reutilizáveis para as rotas (auth)/

### Inventário completo de componentes existentes

#### Layout
| Componente | Props-chave | Pronto para auth? |
|-----------|-------------|-------------------|
| `AppShell` | `isLoggedIn`, `activePath`, `user` | ✅ Passar `isLoggedIn={true}` |
| `Sidebar` | `isLoggedIn`, `activePath` | ✅ Usado via AppShell |
| `Header` | `isLoggedIn`, `user` | ✅ Mostra Bell + Avatar quando logado |

#### UI
| Componente | Props-chave | Uso nas rotas auth |
|-----------|-------------|-------------------|
| `PageHeader` | `icon`, `title`, `subtitle` | ✅ Todas as páginas de seção |

#### Vídeo
| Componente | Props-chave | Uso nas rotas auth |
|-----------|-------------|-------------------|
| `VideoCard` | `video: Video`, `size: 'large'\|'medium'` | ✅ Histórico, Liked, Watch-Later, Subscriptions |
| `VideoGrid` | `videos`, `size`, `title`, `titleIcon` | ✅ Agrupa VideoCards |
| `PaywallCard` | `channelName: string` | ✅ Watch de exclusivo (já implementado) |

#### Canal
| Componente | Props-chave | Uso nas rotas auth |
|-----------|-------------|-------------------|
| `ChannelCard` | `channel: Channel` | ✅ Grid de canais (140px) |
| `ChannelRow` | `channels`, `title`, `titleIcon` | ✅ Linha horizontal de canais |
| `ChannelListItem` | `channel: Channel` | ✅ Lista vertical com botão Seguir |
| `ChannelHeader` | `channel`, `bannerUrl` | — (página de canal, não auth) |
| `ChannelTabs` | — | — (página de canal) |
| `ChannelVideoBar` | — | — (página de canal) |

#### Auth
| Componente | Props-chave | Uso |
|-----------|-------------|-----|
| `LoginCard` | — | ✅ Já implementado na `/login` |

### Mapeamento rota → componentes reutilizáveis

| Rota (auth)/ | Componentes a usar | Observação |
|-------------|-------------------|------------|
| `home` | `AppShell` + `VideoGrid(large)` + `ChannelRow` + `VideoGrid(medium)` | Mesmo layout da home pública, mas `isLoggedIn={true}` |
| `subscriptions` | `AppShell` + `PageHeader` + `ChannelRow` + `VideoGrid` | Grid de canais assinados + vídeos recentes |
| `following` | `AppShell` + `PageHeader` + `ChannelListItem[]` | Lista de canais seguidos com botão Deixar de seguir |
| `history` | `AppShell` + `PageHeader` + `VideoGrid(medium)` | Vídeos assistidos |
| `watch-later` | `AppShell` + `PageHeader` + `VideoGrid(medium)` | Vídeos salvos |
| `liked` | `AppShell` + `PageHeader` + `VideoGrid(medium)` | Vídeos curtidos |
| `referrals` | `AppShell` + `PageHeader` + layout próprio | Cards de indicação — sem componente existente |
| `affiliates` | `AppShell` + `PageHeader` + layout próprio | Dashboard de afiliados — sem componente existente |
| `affiliates/apply` | `AppShell` + formulário | Formulário de aplicação — sem componente existente |

---

## 6. Gaps a preencher

### Críticos (bloqueiam funcionamento)
- [ ] **`middleware.ts`** — proteger todas as rotas `/(auth)/**`
- [ ] **NextAuth ou equivalente** — providers Google + Twitch
- [ ] **`app/(auth)/layout.tsx`** — guard de sessão compartilhado

### Importantes (UX/funcionalidade)
- [ ] **Sidebar com `usePathname()`** — highlight automático sem prop manual
- [ ] **Header: dropdown do avatar** — logout, ver perfil, configurações
- [ ] **Header: badge de notificações** no ícone Bell

### Por página
- [ ] Componentes novos para `referrals` (cards de indicação, stats)
- [ ] Componentes novos para `affiliates` (dashboard, tabela de comissões)
- [ ] Formulário para `affiliates/apply`

---

## 7. Ordem de implementação recomendada

**Fase 1 — Páginas sem novos componentes (só montar com existentes):**
1. `app/(auth)/home/page.tsx` — referência de layout, igual à public home + `isLoggedIn={true}`
2. `app/(auth)/history/page.tsx` — `PageHeader` + `VideoGrid`
3. `app/(auth)/watch-later/page.tsx` — `PageHeader` + `VideoGrid`
4. `app/(auth)/liked/page.tsx` — `PageHeader` + `VideoGrid`
5. `app/(auth)/following/page.tsx` — `PageHeader` + `ChannelListItem[]`
6. `app/(auth)/subscriptions/page.tsx` — `PageHeader` + `ChannelRow` + `VideoGrid`

**Fase 2 — Páginas com layout proprietário (consultar Figma antes):**
7. `app/(auth)/referrals/page.tsx` — nodeId `102:1569`
8. `app/(auth)/affiliates/page.tsx` — nodeId `109:2287`
9. `app/(auth)/affiliates/apply/page.tsx` — nodeId `113:3564`

**Fase 3 — Auth real (pode ser paralela às páginas):**
10. Instalar e configurar NextAuth
11. Criar `middleware.ts`
12. Criar `app/(auth)/layout.tsx`
13. Conectar `user` real ao `AppShell`

---

## Padrão de página auth (template)

```tsx
// app/(auth)/[rota]/page.tsx
// Server Component — sem 'use client'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
// ... imports de componentes específicos
import { IconName } from 'lucide-react'
import { mockVideos, mockChannels } from '@/lib/mock-data'

export default function NomePage() {
  return (
    <AppShell isLoggedIn={true} activePath="/rota">
      <div className="p-[16px]">
        <PageHeader
          icon={<IconName size={24} />}
          title="Título"
          subtitle="Descrição da seção"
        />
        {/* conteúdo */}
      </div>
    </AppShell>
  )
}
```
