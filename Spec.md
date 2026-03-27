# Spec.md — Implementação das Rotas (auth)/

> Gerado em: 2026-03-25
> Baseado em: PRD-auth.md + leitura direta dos componentes + contexto de design Figma

---

## Resumo

Implementar 9 páginas do grupo de rotas `app/(auth)/`, um layout compartilhado e um componente de estado vazio reutilizável. **Sem autenticação real.** Todas as páginas são Server Components com mock data estático. A Sidebar já exibe as seções "Você" e "Comunidade" automaticamente quando `isLoggedIn={true}`.

**Total de arquivos:** 12 (1 MODIFICAR, 1 layout novo, 9 páginas novas, 1 componente novo)

---

## Pré-condições confirmadas (não tocar)

- `AppShell` aceita `isLoggedIn` e `activePath` — pronto ✅
- `Header` renderiza Bell + Avatar quando `isLoggedIn={true}` — pronto ✅
- `Sidebar` exibe seções "Você" e "Comunidade" quando `isLoggedIn={true}` — pronto ✅
- `mockVideos` (7 itens) e `mockChannels` (10 itens) disponíveis em `@/lib/mock-data` ✅
- Tipos `Video`, `Channel` definidos em `@/lib/types` ✅

---

## Arquivo 1 — MODIFICAR: `components/layout/Sidebar.tsx`

**Ação:** Tornar `activePath` dinâmico via `usePathname()`.

**O que fazer:**
1. A Sidebar já é `'use client'` — sem mudança de diretiva
2. Remover dependência de `activePath` como prop estática para o highlight
3. Dentro do componente, chamar `const pathname = usePathname()` (importar de `'next/navigation'`)
4. Substituir `activePath === item.href` por `pathname === item.href` no `NavLink`
5. Manter a prop `activePath` na interface por compatibilidade (pode ser ignorada internamente ou removida — preferir remover se não usada em nenhum outro lugar)

**Impacto:** Todas as páginas (`(public)` e `(auth)/`) passam a ter highlight automático sem precisar passar `activePath` manualmente ao `AppShell`. Atualizar chamadas existentes retirando `activePath` como prop é opcional (não quebra nada manter).

**Atenção:** `AppShell` passa `activePath` para a Sidebar. Após a mudança, o `AppShell` não precisa mais receber nem repassar essa prop — mas mantê-la como prop obsoleta não causa erro.

---

## Arquivo 2 — CRIAR: `app/(auth)/layout.tsx`

**Ação:** Criar layout compartilhado do grupo de rotas autenticadas.

**O que fazer:**
- Server Component (sem `'use client'`)
- Renderizar apenas `{children}` — sem AppShell (cada página monta seu próprio AppShell)
- Propósito desta fase: marcar o grupo como "autenticado" para futuras guards de sessão
- Mock user definido aqui e passado via Context ou simplesmente como constante local por ora

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

**Nota:** Quando NextAuth for adicionado no futuro, este arquivo receberá o `getServerSession()` guard. Por ora é um pass-through intencional.

---

## Arquivo 3 — CRIAR: `components/ui/EmptyState.tsx`

**Ação:** Componente reutilizável para estado vazio das páginas de coleção.

**Interface:**
```ts
interface EmptyStateProps {
  icon: React.ReactNode   // SVG ou componente lucide-react
  title: string           // Geist Bold, 24px, branco
  subtitle: string        // Geist Medium, 16px, #737373
}
```

**Layout:**
- Centralizado vertical e horizontal no espaço disponível
- Container: `flex flex-col items-center justify-center gap-4 h-full min-h-[400px] text-center`
- Ícone: wrapper `w-16 h-16 flex items-center justify-center text-muted` (ícone 48px)
- Título: `text-2xl font-bold text-primary` (24px Geist Bold, branco `#ffffff`)
- Subtítulo: `text-base font-medium text-muted` (16px, `#737373`)

**Referência visual:** Padrão da tela de login `node 94:1352` — centralizado, esparso, sem borda.

```tsx
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle: string
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[400px] text-center px-4">
      <div className="w-16 h-16 flex items-center justify-center text-muted">
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <p className="text-base font-medium text-muted">{subtitle}</p>
      </div>
    </div>
  )
}
```

---

## Arquivo 4 — CRIAR: `app/(auth)/home/page.tsx`

**Figma nodeId:** `94:1583`
**Ação:** Home logada — layout idêntico à home pública, com `isLoggedIn={true}`.

**O que fazer:**
- Server Component
- Importar: `AppShell`, `VideoGrid`, `ChannelRow`, `Tv` de `lucide-react`, `mockVideos`, `mockChannels`
- `largeVideos = mockVideos.slice(0, 3)` — 3 VideoCard large (507px)
- `mediumVideos = mockVideos.slice(3)` — 4+ VideoCard medium (376px)
- AppShell com `isLoggedIn={true}` (activePath removível após mudança da Sidebar)
- Estrutura de 3 seções: VideoGrid large → ChannelRow → VideoGrid medium

**Mock user:** Definir inline:
```ts
const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }
```
Passar como `user={mockUser}` no AppShell.

```tsx
// app/(auth)/home/page.tsx
import AppShell from '@/components/layout/AppShell'
import VideoGrid from '@/components/video/VideoGrid'
import ChannelRow from '@/components/channel/ChannelRow'
import { Tv } from 'lucide-react'
import { mockVideos, mockChannels } from '@/lib/mock-data'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function AuthHomePage() {
  const largeVideos = mockVideos.slice(0, 3)
  const mediumVideos = mockVideos.slice(3)

  return (
    <AppShell isLoggedIn={true} activePath="/home" user={mockUser}>
      <div className="p-[16px]">
        <VideoGrid videos={largeVideos} size="large" />
        <ChannelRow
          channels={mockChannels}
          title="Canais Para Assistir"
          titleIcon={<Tv size={20} className="text-white" />}
        />
        <VideoGrid videos={mediumVideos} size="medium" />
      </div>
    </AppShell>
  )
}
```

---

## Arquivo 5 — CRIAR: `app/(auth)/subscriptions/page.tsx`

**Figma nodeId:** `94:2621`
**Ação:** Página de Assinaturas — estado vazio nesta fase.

**O que fazer:**
- Server Component
- `PageHeader` com ícone `Star`, título "Assinaturas", subtitle "Canais que você assina"
- `EmptyState` com ícone `Star` (48px), título "Nenhuma assinatura ainda", subtitle "Suas assinaturas aparecerão aqui"
- AppShell com `isLoggedIn={true}`, `activePath="/subscriptions"`, `user={mockUser}`

```tsx
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Star } from 'lucide-react'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function SubscriptionsPage() {
  return (
    <AppShell isLoggedIn={true} activePath="/subscriptions" user={mockUser}>
      <div className="p-[16px]">
        <PageHeader
          icon={<Star size={24} />}
          title="Assinaturas"
          subtitle="Canais que você assina"
        />
        <EmptyState
          icon={<Star size={48} />}
          title="Nenhuma assinatura ainda"
          subtitle="Suas assinaturas aparecerão aqui"
        />
      </div>
    </AppShell>
  )
}
```

---

## Arquivo 6 — CRIAR: `app/(auth)/following/page.tsx`

**Figma nodeId:** `96:827`
**Ação:** Página Seguindo — estado vazio.

**O que fazer:**
- `PageHeader`: ícone `Heart`, título "Seguindo", subtitle "Canais que você segue"
- `EmptyState`: ícone `Heart` (48px), título "Você não segue nenhum canal", subtitle "Canais que você segue aparecerão aqui"
- AppShell: `activePath="/following"`

---

## Arquivo 7 — CRIAR: `app/(auth)/history/page.tsx`

**Figma nodeId:** `97:1025`
**Ação:** Página Histórico — estado vazio.

**O que fazer:**
- `PageHeader`: ícone `History`, título "Histórico", subtitle "Vídeos que você assistiu"
- `EmptyState`: ícone `History` (48px), título "Histórico vazio", subtitle "Seu histórico aparecerá aqui"
- AppShell: `activePath="/history"`

---

## Arquivo 8 — CRIAR: `app/(auth)/watch-later/page.tsx`

**Figma nodeId:** `101:1255`
**Ação:** Página Assistir Mais Tarde — estado vazio.

**O que fazer:**
- `PageHeader`: ícone `Clock`, título "Assistir mais tarde", subtitle "Vídeos salvos para ver depois"
- `EmptyState`: ícone `Clock` (48px), título "Nenhum vídeo salvo", subtitle "Vídeos salvos aparecerão aqui"
- AppShell: `activePath="/watch-later"`

---

## Arquivo 9 — CRIAR: `app/(auth)/liked/page.tsx`

**Figma nodeId:** `102:1413`
**Ação:** Página Vídeos Curtidos — estado vazio.

**O que fazer:**
- `PageHeader`: ícone `ThumbsUp`, título "Vídeos Curtidos", subtitle "Vídeos que você curtiu"
- `EmptyState`: ícone `ThumbsUp` (48px), título "Nenhum vídeo curtido ainda", subtitle "Vídeos curtidos aparecerão aqui"
- AppShell: `activePath="/liked"`

---

## Arquivo 10 — CRIAR: `app/(auth)/referrals/page.tsx`

**Figma nodeId:** `102:1569`
**Ação:** Página Indicações — estado vazio com placeholder.

**O que fazer:**
- `PageHeader`: ícone `Gift`, título "Indicações", subtitle "Convide amigos e ganhe recompensas"
- `EmptyState`: ícone `Gift` (48px), título "Nenhuma indicação ainda", subtitle "Suas indicações aparecerão aqui"
- AppShell: `activePath="/referrals"`
- **Nota para Fase 2:** Consultar Figma node `102:1569` antes de implementar layout completo (cards de stats + lista de indicados)

---

## Arquivo 11 — CRIAR: `app/(auth)/affiliates/page.tsx`

**Figma nodeId:** `109:2287`
**Ação:** Página Afiliados — estado vazio com CTA para aplicar.

**O que fazer:**
- `PageHeader`: ícone `Link2`, título "Afiliados", subtitle "Programa de afiliados Vod.TV"
- `EmptyState` com ícone `Link2` (48px), título "Programa de afiliados", subtitle "Você ainda não é afiliado"
- Adicionar botão CTA abaixo do EmptyState: `<Link href="/affiliates/apply">` com estilo accent (`bg-accent text-accent-fg rounded-sm px-4 py-2 font-medium text-base`)
- AppShell: `activePath="/affiliates"`
- **Nota para Fase 2:** Consultar Figma node `109:2287` antes de implementar dashboard completo

---

## Arquivo 12 — CRIAR: `app/(auth)/affiliates/apply/page.tsx`

**Figma nodeId:** `113:3564`
**Ação:** Formulário de aplicação ao programa de afiliados — placeholder.

**O que fazer:**
- `PageHeader`: ícone `Link2`, título "Aplicar como Afiliado", subtitle "Preencha o formulário para se candidatar"
- Formulário placeholder com campos básicos (apenas estrutura visual, sem lógica):
  - Input: Nome completo
  - Input: Email
  - Input: Link do canal
  - Textarea: Por que deseja ser afiliado?
  - Botão submit com estilo accent: "Enviar candidatura"
- Todos os inputs com estilo `bg-surface-secondary border border-vod rounded-sm px-3 py-2 text-primary w-full`
- Submit: `bg-accent text-accent-fg rounded-sm px-4 py-2 font-medium text-base w-full`
- AppShell: `activePath="/affiliates"`
- **Nota para Fase 2:** Consultar Figma node `113:3564` antes de implementar layout final

---

## Constante mockUser — Padrão para todas as páginas (auth)/

Todas as páginas `(auth)/` devem declarar localmente:

```ts
const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }
```

E passar como `user={mockUser}` ao AppShell. Quando NextAuth for adicionado, essa constante será substituída pelo `session.user` real.

---

## Ícones Lucide — Mapeamento por página

| Página | Ícone | Import |
|--------|-------|--------|
| home | — | — |
| subscriptions | `Star` | `lucide-react` |
| following | `Heart` | `lucide-react` |
| history | `History` | `lucide-react` |
| watch-later | `Clock` | `lucide-react` |
| liked | `ThumbsUp` | `lucide-react` |
| referrals | `Gift` | `lucide-react` |
| affiliates | `Link2` | `lucide-react` |
| affiliates/apply | `Link2` | `lucide-react` |

Todos esses ícones já estão importados na `Sidebar.tsx` — confirmar que `lucide-react` está disponível antes de iniciar.

---

## Ordem de implementação

1. `components/ui/EmptyState.tsx` — base para todas as páginas de estado vazio
2. `components/layout/Sidebar.tsx` — usePathname() para highlight automático
3. `app/(auth)/layout.tsx` — pass-through, desbloqueia o grupo de rotas
4. `app/(auth)/home/page.tsx` — referência de layout (mais complexa)
5. `app/(auth)/history/page.tsx` — padrão simples: PageHeader + EmptyState
6. `app/(auth)/watch-later/page.tsx` — mesmo padrão
7. `app/(auth)/liked/page.tsx` — mesmo padrão
8. `app/(auth)/following/page.tsx` — mesmo padrão
9. `app/(auth)/subscriptions/page.tsx` — mesmo padrão
10. `app/(auth)/referrals/page.tsx` — mesmo padrão + Fase 2 Figma
11. `app/(auth)/affiliates/page.tsx` — mesmo padrão + CTA
12. `app/(auth)/affiliates/apply/page.tsx` — formulário placeholder

---

## O que NÃO está no escopo desta Spec

- Autenticação real (NextAuth, lucia, better-auth)
- `middleware.ts` para proteção de rotas
- Badge de notificações no Header
- Dropdown no Avatar do Header
- Conteúdo real para Fase 2 (referrals, affiliates dashboard)
- Integração com API ou banco de dados
