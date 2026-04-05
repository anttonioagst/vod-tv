# PRD — Ciclo 1: "Conectar o que já existe"

> **Fonte:** `COMPETITIVE_GAPS.md` — análise contra Vody.gg em 03/04/2026
> **Objetivo:** Transformar UI funcional em features reais com escrita no banco.
> **Escopo:** 4 features. Nenhuma nova tela. Nenhum novo componente de base.
> **Constraint:** Não implementar nada fora das 4 features abaixo.

---

## Feature 1 — Follow funcional

### Comportamento esperado

O usuário logado clica no botão de coração (Heart) na `ChannelHeader` e o estado persiste no banco. O botão alterna entre "Seguindo" e "Seguir" com feedback visual imediato (optimistic update). A sidebar do usuário, que já exibe canais seguidos via `getFollowing()`, reflete automaticamente o novo estado na próxima navegação.

**Antes:** botão Heart é decorativo (`<button>` sem handler, sem escrita no banco).
**Depois:** clique alterna `follows` row no Supabase; sidebar mostra o canal recém-seguido.

### Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `components/channel/ChannelHeader.tsx` | Adicionar `isFollowing` prop + `toggleFollow` Server Action call + optimistic state local |
| `app/(public)/channel/[slug]/page.tsx` | Buscar `isFollowing` do banco (via `getIsFollowing`) e passar para `ChannelHeader` |
| `lib/supabase/queries/user-data.ts` | Adicionar `getIsFollowing(userId, channelId): Promise<boolean>` |
| `lib/supabase/actions/channel.ts` *(novo)* | Server Action `toggleFollow(channelId)` — insert/delete em `follows` |

### Queries / Tabelas Supabase

**Tabela:** `follows`
```
follows (
  id         uuid PK,
  user_id    uuid FK → auth.users,
  channel_id uuid FK → channels,
  created_at timestamptz
)
```

**`getIsFollowing(userId, channelId)`**
```sql
SELECT id FROM follows
WHERE user_id = $userId AND channel_id = $channelId
LIMIT 1
```
Retorna `true` se row existir, `false` caso contrário.

**`toggleFollow(channelId)` — Server Action**
- Verificar sessão com `supabase.auth.getUser()`.
- Checar se row já existe em `follows`.
- Se existir: `DELETE FROM follows WHERE user_id = ... AND channel_id = ...`
- Se não existir: `INSERT INTO follows (user_id, channel_id) VALUES (..., ...)`
- Chamar `revalidatePath('/channel/[slug]')` e `revalidatePath('/')` para refletir na sidebar.

### Edge cases

| Caso | Tratamento |
|------|-----------|
| Usuário não logado clica em Follow | Redirecionar para `/login` ou exibir tooltip "Faça login para seguir" — sem disparar a Server Action |
| Double-click rápido antes do servidor responder | Desabilitar o botão (`disabled` ou `isPending` via `useTransition`) até o round-trip completar |
| Optimistic update + erro de servidor | Reverter estado local no `catch` e exibir toast/mensagem de erro inline |
| Usuário já segue o canal (página carregada com `isFollowing=true`) | Botão exibido em estado "Seguindo" desde o SSR; primeiro clique faz unfollow |
| `channel_id` inválido / canal deletado | Server Action retorna erro — tratar com `try/catch`, não quebrar a página |
| Sidebar de canais seguidos: canal aparece/desaparece | `revalidatePath` no `(auth)/layout.tsx` já re-busca `getFollowing()` — sem lógica extra necessária |

---

## Feature 2 — Curtir vídeo funcional

### Comportamento esperado

Na página `/watch/[id]`, o usuário logado vê um botão de curtir (ThumbsUp) abaixo da área do player/paywall. Clicar alterna o estado de curtida no banco. O botão reflete o estado atual do banco ao carregar a página. A listagem em `/liked` já funciona via `getLikedVideos()` — ao curtir, o vídeo aparece lá na próxima visita.

**Antes:** `video_likes` é lido (para a página `/liked`) mas nunca escrito via UI.
**Depois:** botão na watch page insere/remove em `video_likes`.

### Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `app/(public)/watch/[id]/page.tsx` | Buscar `isLiked` do banco + passar para novo `LikeButton` |
| `components/video/LikeButton.tsx` *(novo)* | Client Component com optimistic state, chama Server Action `toggleLike` |
| `lib/supabase/queries/user-data.ts` | Adicionar `getIsLiked(userId, videoId): Promise<boolean>` |
| `lib/supabase/actions/video.ts` *(novo)* | Server Action `toggleLike(videoId)` — insert/delete em `video_likes` |

### Queries / Tabelas Supabase

**Tabela:** `video_likes`
```
video_likes (
  id         uuid PK,
  user_id    uuid FK → auth.users,
  video_id   uuid FK → videos,
  created_at timestamptz
)
```

**`getIsLiked(userId, videoId)`**
```sql
SELECT id FROM video_likes
WHERE user_id = $userId AND video_id = $videoId
LIMIT 1
```

**`toggleLike(videoId)` — Server Action**
- Verificar sessão com `supabase.auth.getUser()`.
- Checar se row existe em `video_likes`.
- Se existir: `DELETE FROM video_likes WHERE user_id = ... AND video_id = ...`
- Se não existir: `INSERT INTO video_likes (user_id, video_id) VALUES (..., ...)`
- `revalidatePath('/watch/[id]')` e `revalidatePath('/liked')`.

### Posicionamento do botão na watch page

O botão `LikeButton` deve ser inserido na `WatchPage` abaixo da área do player (fora do `PaywallCard`), visível independente de o usuário ter assinatura. Usar design do sistema: ícone `ThumbsUp` (lucide-react), texto "Curtir" / "Curtido", cor `text-accent` quando ativo.

### Edge cases

| Caso | Tratamento |
|------|-----------|
| Usuário não logado | `LikeButton` exibe estado desabilitado ou redireciona para `/login` ao clicar — sem chamar a Server Action |
| Double-click antes do servidor responder | `useTransition` + `isPending` para travar o botão durante o round-trip |
| Optimistic update + erro | Reverter estado local e exibir mensagem de erro inline |
| Vídeo exclusivo sem assinatura | O botão de curtir deve ser visível mesmo atrás do paywall — curtir não requer assinatura |
| `video_id` inválido | Server Action trata erro do Supabase; a página já usa `notFound()` se o vídeo não existir |
| Constraint UNIQUE em `video_likes(user_id, video_id)` | Se já existir e o insert falhar com `23505`, tratar como "já curtido" (sem mostrar erro ao usuário) |

---

## Feature 3 — Incremento de views

### Comportamento esperado

Ao acessar `/watch/[id]`, o `view_count` do vídeo é incrementado em 1 no banco e uma linha é inserida em `video_views` (permitindo histórico). O valor lido pelo `getTrendingVideos()` (que ordena por `view_count`) passa a refletir acessos reais.

**Antes:** `view_count` é lido do banco mas nunca escrito pela aplicação.
**Depois:** cada acesso à watch page dispara um registro de view.

### Estratégia de implementação

Duas opções viáveis — recomendação é a **Opção A** por simplicidade e sem dependência de trigger Supabase:

**Opção A — Server Action chamada durante o Server Component render (recomendada)**
- `app/(public)/watch/[id]/page.tsx` chama `recordView(videoId, userId?)` diretamente no render do Server Component, em paralelo com as outras queries existentes (`getVideoById`, `getRelatedVideos`).
- Não bloqueia o render — usar `Promise.allSettled` para que falha de view não quebre a página.

**Opção B — Trigger Supabase**
- Trigger na tabela `video_views` que incrementa `videos.view_count` automaticamente via `UPDATE videos SET view_count = view_count + 1 WHERE id = NEW.video_id`.
- Requer acesso ao painel Supabase para configurar. Mais robusto a longo prazo.
- Se escolhida, apenas inserir em `video_views` e deixar o trigger fazer o resto.

### Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `app/(public)/watch/[id]/page.tsx` | Chamar `recordView(videoId, userId?)` em `Promise.allSettled` junto com as queries existentes |
| `lib/supabase/actions/video.ts` *(novo ou existente)* | Função `recordView(videoId, userId?)` — insert em `video_views` + UPDATE em `videos.view_count` (se Opção A) |

### Queries / Tabelas Supabase

**Tabela:** `video_views`
```
video_views (
  id         uuid PK,
  user_id    uuid FK → auth.users NULLABLE (view anônima),
  video_id   uuid FK → videos,
  watched_at timestamptz DEFAULT now()
)
```

**`recordView(videoId, userId?)`**
```sql
-- Insert na tabela de histórico
INSERT INTO video_views (user_id, video_id) VALUES ($userId, $videoId)

-- Incremento do contador (executar em seguida ou via trigger)
UPDATE videos SET view_count = view_count + 1 WHERE id = $videoId
```

### Edge cases

| Caso | Tratamento |
|------|-----------|
| Usuário não logado | Inserir em `video_views` com `user_id = null` (coluna nullable) — view anônima ainda conta para `view_count` |
| Usuário recarrega a página várias vezes | Aceitar múltiplas views por sessão (comportamento padrão do YouTube/Vody) em V1. Deduplicação pode ser adicionada depois com janela de tempo (ex: 1 view por usuário por hora por vídeo) |
| Vídeo não encontrado | `page.tsx` já chama `notFound()` antes — `recordView` só é chamado se `video` existir |
| Falha na inserção de view | Usar `Promise.allSettled` — erro silencioso, não quebra a página nem impede o usuário de ver o conteúdo |
| `view_count` em `videos` fora de sincronia | Em V1 aceitar eventual inconsistência. Em V2 usar trigger Supabase para garantir consistência atômica |
| Bots / crawlers inflando views | Fora do escopo do Ciclo 1 — tratar depois com rate limiting |

---

## Feature 4 — Sidebar Expandir/Recolher

### Comportamento esperado

O botão "Expandir/Recolher" no rodapé da sidebar alterna entre dois estados:
- **Expandida (padrão):** 255px de largura, ícone + label visíveis em cada item de nav.
- **Recolhida:** ~64px de largura, apenas ícones visíveis, labels ocultos com `overflow-hidden` + `opacity-0` ou `hidden`.

O estado persiste enquanto o usuário navega (sem recarregar a página), mas não é salvo no banco (apenas `localStorage` opcional).

**Antes:** botão existe mas não faz nada (`<button>` sem handler).
**Depois:** clique alterna estado visual da sidebar; AppShell reage à nova largura.

### Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `components/layout/Sidebar.tsx` | Adicionar `useState(false)` para `isCollapsed`; aplicar classes condicionais na `<aside>` e em cada item de nav; conectar o botão "Expandir/Recolher" ao handler |
| `components/layout/AppShell.tsx` | Passar `onCollapse` callback OU elevar estado para `AppShell` se a largura do main precisar se ajustar |

### Abordagem de estado

**Opção A — Estado local em `Sidebar` (mais simples, recomendada)**
- `Sidebar.tsx` controla `isCollapsed` internamente.
- `AppShell.tsx` não precisa mudar — o layout usa `flex` e a sidebar ocupa apenas seu espaço natural.
- A sidebar usa `transition-all duration-200` para animar a largura.

**Opção B — Estado elevado para `AppShell`**
- Útil se o `<main>` precisar de lógica extra ao colapsar (ex: ajustar padding).
- `AppShell` recebe `defaultCollapsed?: boolean` e passa `isCollapsed` + `setIsCollapsed` para `Sidebar`.

### Classes CSS condicionadas

```tsx
// <aside>
className={`${isCollapsed ? 'w-[64px]' : 'w-[255px]'} transition-all duration-200 ...`}

// Labels dos nav items
<span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>

// Ícone do botão Expandir/Recolher
<ChevronsUpDown size={16} className={`${isCollapsed ? 'rotate-90' : ''} transition-transform duration-200`} />
```

### Edge cases

| Caso | Tratamento |
|------|-----------|
| Tooltip nos ícones no estado recolhido | Adicionar `title={item.label}` nos `<Link>` e `<button>` para acessibilidade básica; tooltip estilizado pode ser V2 |
| Logo da Vod.TV quando recolhida | Ocultar logo SVG ou trocar por versão ícone apenas (logo quadrado) |
| Section labels ("Você", "Comunidade", etc.) | Ocultar com `hidden` no estado recolhido |
| Canais na seção Seguindo/Explorar | Ocultar nome, manter apenas avatar (já 26×26px) |
| Largura do `<main>` não se ajusta corretamente | Garantir que `AppShell` usa `flex` sem `width` fixo no `<main>` — o `flex-1` já resolve |
| Estado perdido ao navegar | Normal — é estado de sessão. Se quiser persistir: `localStorage.getItem('sidebar-collapsed')` no `useEffect` após mount |
| Mobile / viewport estreito | Fora do escopo do Ciclo 1 — sidebar responsiva é Ciclo 2+ |
| `Sidebar.tsx` já é `'use client'` | Sem mudança necessária na diretiva |

---

## Dependências entre features

```
Feature 1 (Follow)    → cria lib/supabase/actions/channel.ts
Feature 2 (Like)      → cria lib/supabase/actions/video.ts
Feature 3 (Views)     → usa/expande lib/supabase/actions/video.ts (mesmo arquivo que Feature 2)
Feature 4 (Sidebar)   → independente, sem deps externas
```

Features 2 e 3 compartilham o mesmo arquivo de actions — implementar juntas ou garantir que o arquivo seja criado antes.

---

## Ordem de implementação sugerida

1. **Feature 4** — Sidebar Expandir/Recolher (sem Supabase, zero risco, validação visual imediata)
2. **Feature 3** — Incremento de views (Server Component, sem UI nova, impacto imediato nos dados)
3. **Feature 2** — Curtir vídeo (cria actions/video.ts, LikeButton Client Component)
4. **Feature 1** — Follow funcional (mais complexo: prop drilling, revalidatePath em 2 paths, sidebar dinâmica)

---

## Critérios de aceite

| Feature | Critério |
|---------|---------|
| Follow | Clicar em Follow no canal escreve em `follows`; recarregar a página mantém o estado; canal aparece na sidebar do usuário logado |
| Like | Clicar em Curtir na watch page escreve em `video_likes`; recarregar mantém estado; vídeo aparece em `/liked` |
| Views | Cada acesso a `/watch/[id]` incrementa `view_count` em `videos` e insere row em `video_views`; `/trending` reflete a contagem real |
| Sidebar | Clicar em Expandir/Recolher alterna largura da sidebar; labels somem/aparecem; ícones sempre visíveis |
