# Design System — Vod.TV

> Gerado em: 2026-04-03. Fonte da verdade visual do projeto.
> Fontes: `tailwind.config.ts`, `styles/tokens.css`, `app/globals.css`, componentes existentes.

---

## Paleta de Cores

| Classe Tailwind | CSS Var | Hex | Uso Semântico |
|----------------|---------|-----|---------------|
| `bg-surface` | `--color-bg-primary` | `#0c0c0c` | Fundo principal da aplicação, sidebar, header |
| `bg-surface-secondary` | `--color-bg-secondary` | `#191919` | Inputs, hover de nav items, dropdown menus, PageHeader |
| `bg-surface-elevated` | `--color-bg-elevated` | `#262626` | Search button, elementos elevados, hover de dropdown items |
| `bg-surface-card` | `--color-bg-card` | `#19191a` | Channel cards |
| `bg-surface-player` | — | `#171717` | Player de vídeo |
| `bg-vod` / `border-vod` | `--color-border-default` | `#3e3e3e` | Bordas gerais, bg de badges (duração, Exclusivo), hover de nav items, active state |
| `border-vod-subtle` | `--color-border-subtle` | `#343434` | Divisores de seção (`border-b`) na sidebar |
| `text-primary` | `--color-text-primary` | `#ffffff` | Títulos, texto de destaque, nav items |
| `text-secondary` | `--color-text-secondary` | `#bfbebe` | Nav labels padrão, texto secundário |
| `text-muted` | `--color-text-muted` | `#737373` | Nome do canal em video card, subtítulos |
| `text-subtle` | `--color-text-subtle` | `#a1a1a1` | @handles em channel cards |
| `bg-accent` / `text-accent` | `--color-accent` | `#fdff79` | CTA primário (botão Entrar, Assinar), badges Exclusivo, estado ativo (following, liked) |
| `text-accent-fg` | `--color-accent-foreground` | `#0c0c0c` | Texto sobre fundo accent |
| `bg-twitch` | — | `#9146FF` | Ícone/badge Twitch |

---

## Tipografia

### Famílias
| Classe Tailwind | CSS Var | Família | Uso |
|----------------|---------|---------|-----|
| `font-primary` | `--font-primary` | `Geist, sans-serif` | UI principal — nav, botões, títulos, toda interface |
| `font-secondary` | `--font-secondary` | `Plus Jakarta Sans, sans-serif` | Nome de canal, handles, dados secundários de conteúdo |

> **Regra:** Use `font-primary` por padrão. Aplique `font-secondary` apenas em metadados de canal/criador (nome do canal, @handle, videoCount).

### Tamanhos
| Classe Tailwind | CSS Var | Px | Uso |
|----------------|---------|-----|-----|
| `text-2xs` | `--text-2xs` | 8px | Badge "Exclusivo" |
| `text-xs` | `--text-xs` | 10px | Duração do vídeo |
| `text-sm` | `--text-sm` | 12px | Labels de seção, channel name (`font-secondary`), @handle |
| `text-base` | `--text-base` | 14px | Nav items, botões, título de vídeo, dropdown, body text |
| `text-lg` | `--text-lg` | 18px | Títulos de seção (ex: "Canais Para Assistir") |

### Pesos
| Tailwind | Valor | Uso |
|---------|-------|-----|
| `font-medium` | 500 | Nav items padrão, labels |
| `font-semibold` | 600 | — |
| `font-bold` | 700 | Títulos de vídeo, badges, botão CTA, channel name |

---

## Border Radius

| Classe | CSS Var | Valor | Uso |
|--------|---------|-------|-----|
| `rounded-xs` | `--radius-xs` | 3px | Badges (duração, Exclusivo) |
| `rounded-sm` | `--radius-sm` | 6px | Botão primário CTA, search bar |
| `rounded-md` | `--radius-md` | 8px | Avatar de canal na sidebar (26×26px) |
| `rounded-lg` | `--radius-lg` | 10px | Nav item ativo, cards, thumbnails, avatares de vídeo (37px) |
| `rounded-full` | `--radius-full` | 9999px | Avatar de canal (64px) em ChannelCard |

---

## Dimensões Fixas

| Token CSS | Tailwind | Valor | Componente |
|-----------|---------|-------|-----------|
| `--sidebar-width` | `w-sidebar` / `w-[255px]` | 255px | Sidebar expandida |
| `--header-height` | `h-header` / `h-[56px]` | 56px | Header |
| `--video-card-lg-width` | `w-video-lg` | 507px | VideoCard large — largura |
| `--video-card-lg-thumb-height` | `h-thumb-lg` | 285px | VideoCard large — thumbnail |
| `--video-card-md-width` | `w-video-md` | 376px | VideoCard medium — largura |
| `--video-card-md-thumb-height` | `h-thumb-md` | 211px | VideoCard medium — thumbnail |
| `--channel-card-width` | `w-channel-card` | 140px | ChannelCard — largura |
| `--channel-card-avatar-size` | `h-channel-avatar` | 64px | ChannelCard — avatar |
| `--video-card-avatar-size` | `h-video-avatar` / `w-[37px] h-[37px]` | 37px | VideoCard — avatar do canal |
| `--search-bar-width` | `w-search-bar` | 568px | Search bar — largura |
| `--search-bar-height` | `h-search-bar` | 42px | Search bar — altura |
| `--icon-size-base` | `size-4` | 16px | Ícones de nav, ações |
| `--icon-size-md` | `size-5` | 20px | Ícone de follow/heart |

---

## Sombras

| Classe Tailwind | Valor | Uso |
|----------------|-------|-----|
| `shadow-vod-button` / `shadow-[0px_1px_2px_0px_rgba(255,255,255,0.06)]` | 0px 1px 2px 0 rgba(255,255,255,0.06) | Botão CTA primário |
| `shadow-[0_8px_24px_rgba(0,0,0,0.5)]` | 0 8px 24px rgba(0,0,0,0.5) | Dropdown menus |

---

## Componentes Padrão

### Botão Primário CTA
```tsx
<button className="flex items-center gap-2 bg-accent text-accent-fg rounded-sm px-[17px] py-[9px] text-base font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.06)] hover:brightness-95 transition-all">
  <Icon size={16} />
  <span>Label</span>
</button>
```

### Botão Secundário (border)
```tsx
<button className="flex items-center gap-2 px-4 py-2 rounded-sm border border-vod text-secondary hover:border-accent hover:text-accent transition-colors duration-150">
  <Icon size={16} />
  <span className="font-primary font-medium text-base">Label</span>
</button>
```

### Botão Toggle com Estado Ativo (follow, like)
```tsx
// Estado inativo → ativo muda border-vod → border-accent, text/fill mudam para text-accent
<button className={`border rounded-sm ... transition-colors duration-150 ${
  isActive ? 'border-accent text-accent' : 'border-vod text-secondary hover:border-accent hover:text-accent'
}`}>
```

### Nav Item da Sidebar
```tsx
<Link className={`flex items-center gap-2 p-2 w-full text-secondary text-base font-medium transition-colors duration-150 ease-out rounded-lg ${
  isActive ? 'bg-vod' : 'hover:bg-vod'
}`}>
  <Icon size={16} />
  <span>{label}</span>
</Link>
```

### VideoCard
```tsx
// Estrutura: Link > [Thumbnail (rounded-lg, overflow-clip)] + [Info (avatar 37px + título/canal)]
// Hover thumbnail: group-hover:scale-105 transition-transform duration-150 ease-out
// Badge posição: absolute top-[10px] left-[10px] (Exclusivo) / bottom-[10px] right-[10px] (duração)
// Badge estilo: bg-vod px-[5px] py-[3px] rounded-xs
<VideoCard video={video} size="large" />   // 507×285px thumb
<VideoCard video={video} size="medium" />  // 376×211px thumb
```

### ChannelCard
```tsx
// Container: bg-surface-card border border-vod rounded-lg w-[140px]
// Hover: hover:border-accent transition-colors duration-150 ease-out
// Avatar: 64px rounded-full
// Nome: font-bold text-base font-secondary
// Handle: font-medium text-sm text-subtle font-secondary
<ChannelCard channel={channel} />
```

### PageHeader (cabeçalho de seção/página)
```tsx
// Container: bg-surface-secondary border border-vod rounded-lg flex items-center gap-4 p-4 mb-4
// Ícone: w-10 h-10 text-accent
// Título: font-medium text-base text-white
// Subtítulo: font-normal text-base text-muted font-secondary
<PageHeader icon={<Icon size={24} />} title="Título" subtitle="Subtítulo" />
```

### EmptyState
```tsx
// Container: flex flex-col items-center justify-center gap-4 h-full min-h-[400px]
// Ícone: w-16 h-16 text-muted
// Título: text-2xl font-bold text-primary
// Subtítulo: text-base font-medium text-muted
<EmptyState icon={<Icon size={32} />} title="Título" subtitle="Subtítulo" />
```

### ChannelHeader
```tsx
// Banner: w-full h-[224px] rounded-lg bg-surface-secondary
// Avatar flutuante: absolute -top-[48px] left-0, 160×160px rounded-lg border-4 border-surface
// Nome: font-bold text-[30px] text-primary
// Metadata: text-[14px] text-muted, separador: w-[3px] h-[3px] rounded-full bg-muted
```

### Dropdown Menu
```tsx
// Container: absolute top-[44px] right-0 w-[220px] bg-surface-secondary border border-vod rounded-lg py-1.5
// Shadow: shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-50
// Item: px-4 py-2.5 text-secondary text-base hover:bg-surface-elevated
// Ícone em item: text-muted size={16}
// Divider: h-px bg-vod-subtle mx-2 my-1
// Item destrutivo: text-red-400
```

### Search Bar
```tsx
// Input: bg-surface-secondary border border-vod border-r-0 rounded-l-sm h-[42px] px-3 text-base text-white placeholder:text-vod
// Botão: bg-surface-elevated border border-vod border-l-0 rounded-r-sm px-6 text-vod
// Container: flex w-[568px] h-[42px] opacity-[0.67] focus-within:opacity-100 transition-opacity
```

### Sidebar Section Divider
```tsx
<div className="border-b border-vod-subtle">
  <div className="p-2">
    <SectionLabel>Nome da Seção</SectionLabel>
    {/* conteúdo */}
  </div>
</div>
```

---

## Estados de UI

### Loading Skeleton
Não há componente centralizado ainda. Padrão a seguir:
```tsx
<div className="animate-pulse bg-surface-secondary rounded-lg w-full h-[altura]" />
```

### Error State
Não há componente centralizado. Usar `<EmptyState>` com ícone de erro e mensagem descritiva.

### Empty State
```tsx
<EmptyState
  icon={<IconComponent size={32} />}
  title="Nenhum item encontrado"
  subtitle="Mensagem explicativa para o usuário"
/>
```

### Estado Desabilitado (botões interativos)
```tsx
// Sempre incluir: disabled:opacity-50 disabled:cursor-not-allowed
// Usar useTransition para operações assíncronas com optimistic UI
```

### Focus Visible (acessibilidade)
```tsx
// Links e botões principais:
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:rounded-lg
// Nav items da sidebar:
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod
// Avatar do header:
ring-offset-surface focus:ring-2 focus:ring-accent
```

---

## Padrões de Layout

### AppShell (estrutura base de todas as páginas)
```tsx
// Estrutura: flex h-screen bg-surface overflow-hidden
//   ├── Sidebar (w-[255px] ou w-[64px] se colapsada, shrink-0)
//   └── div flex-col flex-1 overflow-hidden
//       ├── Header (h-[56px], shrink-0)
//       └── main flex-1 overflow-y-auto
<AppShell isLoggedIn={false} user={user} followedChannels={channels}>
  {/* conteúdo da página */}
</AppShell>
```

### Padding padrão de página
Não há `container` centralizado. Páginas usam padding direto:
- Conteúdo interno: `px-4 py-4` ou `p-4` como ponto de partida
- Seções de conteúdo: observar gap entre cards `gap-[10px]`

### Grid de VideoCards
```tsx
// Usar VideoGrid ou flex wrap com gap
<VideoGrid videos={videos} size="large" />
```

### Row de ChannelCards
```tsx
<ChannelRow channels={channels} />
```

---

## Convenções de Código

### Server vs Client Component
| Cenário | Decisão |
|---------|---------|
| Fetch de dados, sem interatividade | `Server Component` (padrão — sem diretiva) |
| `useState`, `useEffect`, `usePathname`, event handlers | `'use client'` obrigatório |
| `useTransition` para optimistic UI | `'use client'` obrigatório |
| Componentes de layout (AppShell, Header, Sidebar) | `'use client'` (usam hooks de rota/estado) |

### Optimistic UI (padrão do projeto)
```tsx
// Usar useTransition + estado local, com rollback em caso de erro
const [state, setState] = useState(initial)
const [isPending, startTransition] = useTransition()

function handleAction() {
  const optimistic = !state
  setState(optimistic)
  startTransition(async () => {
    try { await serverAction() }
    catch { setState(!optimistic) }  // rollback
  })
}
```

### Nomenclatura de arquivos
- Componentes: `PascalCase.tsx` em `components/categoria/`
- Páginas: `page.tsx` em `app/(rota)/`
- Server Actions: `actions/entidade.ts` em `lib/supabase/`
- Tipos: `lib/types.ts`

### Importações
```tsx
import { Componente } from '@/components/categoria/Componente'
import { createClient } from '@/lib/supabase/client'  // client-side
import { createClient } from '@/lib/supabase/server'  // server-side
```

### Ícones
- SVGs customizados (logo, nav): `<SvgIcon src="/icons/nome.svg" size={16} />`
- Ícones genéricos: `lucide-react` (Bell, Lock, Star, Heart, etc.) — `size={16}` padrão
- Tamanho padrão nav: `16×16px`

---

## Transições Padrão

| Uso | Classe |
|-----|--------|
| Hover de cor/border | `transition-colors duration-150 ease-out` |
| Hover de transform (thumbnail) | `transition-transform duration-150 ease-out` |
| Collapse sidebar | `transition-all duration-200` |
| Brightness no CTA | `transition-all` + `hover:brightness-95` |
| Opacity (search bar) | `transition-opacity` |
