# PRD — Supabase Data Layer
_Gerado em: 2026-03-28_

---

## Situação Atual

| | Estado |
|--|--------|
| Banco Supabase | **Vazio** — schema `public` sem nenhuma tabela |
| Auth Supabase | ✅ Configurado (OAuth Google + Twitch funcionando) |
| Mock data | Ativo em 5 páginas |
| Tabelas necessárias | 0 de 10 criadas |

---

## Parte 1 — Levantamento do Projeto

### Páginas que usam mock data (a conectar)

| Página | Mock usado | Dados necessários |
|--------|-----------|-------------------|
| `app/(auth)/home/page.tsx` | `mockVideos`, `mockChannels` | Vídeos recentes + canais em destaque |
| `app/(public)/trending/page.tsx` | `mockVideos` | Vídeos ordenados por views |
| `app/(public)/channels/page.tsx` | `mockChannels` | Lista de todos os canais |
| `app/channel/[slug]/page.tsx` | `mockChannels`, `mockVideos` | Canal por slug + vídeos do canal |
| `app/watch/[id]/page.tsx` | `mockVideos` | Vídeo por ID + vídeos relacionados |

### Páginas prontas para dados reais (empty state hoje)

| Página | Tabelas que vai consumir |
|--------|--------------------------|
| `app/(auth)/subscriptions/page.tsx` | `subscriptions` + `channels` |
| `app/(auth)/following/page.tsx` | `follows` + `channels` |
| `app/(auth)/history/page.tsx` | `video_views` + `videos` + `channels` |
| `app/(auth)/watch-later/page.tsx` | `watch_later` + `videos` + `channels` |
| `app/(auth)/liked/page.tsx` | `video_likes` + `videos` + `channels` |
| `app/(auth)/referrals/page.tsx` | `referrals` |
| `app/(auth)/affiliates/page.tsx` | `affiliate_applications` + `channels` |
| `app/(auth)/affiliates/apply/page.tsx` | `affiliate_applications` (insert) |

### Tipos TypeScript existentes (`lib/types.ts`)

**`Video`** — campos do mock:
```ts
id, title, thumbnail, duration,       // duration como string "H:MM:SS"
channelName, channelAvatar,            // dados desnormalizados do canal
channelSlug, isExclusive,
views, createdAt
```

**`Channel`** — campos do mock:
```ts
id, name, username, avatar,
description, videoCount,
isSubscribed, isFollowing              // estado do usuário logado
```

**`User`** — campos definidos:
```ts
id, name, avatar, email
```

> **Nota:** `Video.duration` é string ("8:24:11"). No banco será `duration_seconds: integer` e formatado na camada de display. `channelName/channelAvatar/channelSlug` são desnormalizados — virão de JOIN com `channels`.

---

## Parte 2 — Schema do Banco

### Tabela: `profiles`
_Extensão pública do `auth.users` do Supabase._

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:**
- `SELECT` público (leitura de perfis é aberta)
- `INSERT/UPDATE` apenas para o próprio usuário (`auth.uid() = id`)

---

### Tabela: `channels`
_Canal de conteúdo de um criador._

```sql
CREATE TABLE channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug        TEXT UNIQUE NOT NULL,        -- URL: /channel/tteuw
  name        TEXT NOT NULL,
  username    TEXT UNIQUE NOT NULL,        -- @tteuw
  avatar_url  TEXT,
  banner_url  TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:**
- `SELECT` público
- `INSERT/UPDATE/DELETE` apenas para o `owner_id` (`auth.uid() = owner_id`)

---

### Tabela: `videos`
_Conteúdo VOD de um canal._

```sql
CREATE TABLE videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id       UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  thumbnail_url    TEXT,
  video_url        TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,   -- formatar como HH:MM:SS no front
  is_exclusive     BOOLEAN DEFAULT FALSE,
  view_count       INTEGER DEFAULT 0,
  published_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON videos(channel_id);
CREATE INDEX ON videos(published_at DESC);
CREATE INDEX ON videos(view_count DESC);
```

**RLS:**
- `SELECT` público para vídeos não exclusivos; exclusivos requerem `subscriptions` ativa (implementar via policy ou check no servidor)
- `INSERT/UPDATE/DELETE` apenas para o dono do canal

---

### Tabela: `subscriptions`
_Assinatura paga de um usuário a um canal (ou global)._

```sql
CREATE TABLE subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id  UUID REFERENCES channels(id) ON DELETE CASCADE,  -- NULL = global
  plan_type   TEXT NOT NULL CHECK (plan_type IN ('individual', 'global')),
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

CREATE INDEX ON subscriptions(user_id);
```

**RLS:**
- `SELECT` apenas para o próprio usuário (`auth.uid() = user_id`)
- `INSERT` via função server-side (após pagamento)

---

### Tabela: `follows`
_Seguir um canal (gratuito)._

```sql
CREATE TABLE follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id  UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

CREATE INDEX ON follows(user_id);
```

**RLS:**
- `SELECT` público (contagem de seguidores é pública)
- `INSERT/DELETE` apenas para o próprio usuário

---

### Tabela: `video_views`
_Histórico de visualizações._

```sql
CREATE TABLE video_views (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id     UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)                        -- upsert para atualizar timestamp
);

CREATE INDEX ON video_views(user_id, watched_at DESC);
```

**RLS:** `SELECT/INSERT/UPDATE/DELETE` apenas para o próprio usuário.

---

### Tabela: `video_likes`
_Vídeos curtidos._

```sql
CREATE TABLE video_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id    UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX ON video_likes(user_id);
```

**RLS:** idem `video_views`.

---

### Tabela: `watch_later`
_Fila "assistir mais tarde"._

```sql
CREATE TABLE watch_later (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id    UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX ON watch_later(user_id);
```

**RLS:** idem `video_views`.

---

### Tabela: `referrals`
_Sistema de indicações._

```sql
CREATE TABLE referrals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'active', 'expired')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX ON referrals(referrer_id);
```

**RLS:** `SELECT` apenas para `referrer_id` ou `referred_id`.

---

### Tabela: `affiliate_applications`
_Candidaturas ao programa de afiliados._

```sql
CREATE TABLE affiliate_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name  TEXT NOT NULL,
  social_links  TEXT[],
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)                                  -- uma candidatura por usuário
);
```

**RLS:** `SELECT/INSERT` apenas para o próprio usuário.

---

## Parte 3 — Diagrama de Relações

```
auth.users
    │
    ├── profiles (1:1)
    │
    ├── channels (1:N via owner_id)
    │       │
    │       ├── videos (1:N via channel_id)
    │       │       │
    │       │       ├── video_views (N:M users)
    │       │       ├── video_likes (N:M users)
    │       │       └── watch_later (N:M users)
    │       │
    │       ├── subscriptions (N:M users)
    │       └── follows (N:M users)
    │
    ├── referrals (user → user)
    └── affiliate_applications (1:1)
```

---

## Parte 4 — Arquivos a Criar / Modificar

### Novos arquivos

```
lib/supabase/queries/
  ├── videos.ts         — getHomeVideos, getTrendingVideos, getVideoById,
  │                        getChannelVideos, getRelatedVideos
  ├── channels.ts       — getAllChannels, getChannelBySlug, getFeaturedChannels
  ├── user-data.ts      — getSubscriptions, getFollowing, getWatchHistory,
  │                        getWatchLater, getLikedVideos, getReferrals
  └── affiliates.ts     — getAffiliateApplication, submitAffiliateApplication

types/
  └── database.ts       — tipos gerados via: npx supabase gen types typescript
```

### Modificar

| Arquivo | O que muda |
|---------|-----------|
| `lib/types.ts` | Adicionar `duration_seconds: number`; remover campos desnormalizados do `Video`; adicionar `channel: Channel` aninhado; `isSubscribed/isFollowing` viram opcionais (dependem de contexto autenticado) |
| `app/(auth)/home/page.tsx` | `import` de queries reais substituindo mock |
| `app/(public)/trending/page.tsx` | Idem |
| `app/(public)/channels/page.tsx` | Idem |
| `app/channel/[slug]/page.tsx` | Idem |
| `app/watch/[id]/page.tsx` | Idem + verificar assinatura antes de mostrar conteúdo |
| `app/(auth)/subscriptions/page.tsx` | Buscar subscriptions reais |
| `app/(auth)/following/page.tsx` | Buscar follows reais |
| `app/(auth)/history/page.tsx` | Buscar video_views reais |
| `app/(auth)/watch-later/page.tsx` | Buscar watch_later reais |
| `app/(auth)/liked/page.tsx` | Buscar video_likes reais |
| `app/(auth)/referrals/page.tsx` | Buscar referrals reais |
| `app/(auth)/affiliates/page.tsx` | Buscar affiliate_applications |
| `app/(auth)/affiliates/apply/page.tsx` | Submeter candidatura via Server Action |
| `components/layout/Sidebar.tsx` | Buscar canais seguidos via follows |

---

## Parte 5 — Ordem de Implementação

```
Fase 1 — Schema (aplicar migrations)
  1. profiles
  2. channels
  3. videos
  4. follows + subscriptions
  5. video_views + video_likes + watch_later
  6. referrals + affiliate_applications
  7. Triggers: atualizar view_count, video_count em channels

Fase 2 — Types + Queries
  1. npx supabase gen types typescript > types/database.ts
  2. Criar lib/supabase/queries/videos.ts
  3. Criar lib/supabase/queries/channels.ts
  4. Criar lib/supabase/queries/user-data.ts
  5. Criar lib/supabase/queries/affiliates.ts

Fase 3 — Conectar páginas (substituir mock)
  1. Home + Trending + Channels (leitura pública)
  2. Channel[slug] + Watch[id]
  3. Páginas de usuário autenticado

Fase 4 — Seed data
  1. Popular channels com dados reais
  2. Popular videos por canal
```

---

## Parte 6 — Queries de Referência

### Exemplo: Home feed (últimos vídeos)
```sql
SELECT v.*, c.slug, c.name as channel_name, c.avatar_url as channel_avatar
FROM videos v
JOIN channels c ON c.id = v.channel_id
ORDER BY v.published_at DESC
LIMIT 12;
```

### Exemplo: Canal por slug + vídeos
```sql
SELECT * FROM channels WHERE slug = 'tteuw';

SELECT v.*
FROM videos v
WHERE v.channel_id = $channel_id
ORDER BY v.published_at DESC;
```

### Exemplo: Verificar assinatura ativa
```sql
SELECT EXISTS (
  SELECT 1 FROM subscriptions
  WHERE user_id = auth.uid()
    AND (channel_id = $channel_id OR plan_type = 'global')
    AND expires_at > NOW()
) as has_access;
```

### Exemplo: Seguidos (sidebar)
```sql
SELECT c.*
FROM follows f
JOIN channels c ON c.id = f.channel_id
WHERE f.user_id = auth.uid()
ORDER BY f.created_at DESC
LIMIT 10;
```
