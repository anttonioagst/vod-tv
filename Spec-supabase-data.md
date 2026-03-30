# Spec — Supabase Data Layer
_Gerado em: 2026-03-28 | Baseado no PRD-supabase-data.md_

---

## Visão Geral

Este spec descreve a implementação completa do data layer do Vod.TV, substituindo todos os mocks por queries reais ao Supabase. O banco está vazio; o Auth (Google + Twitch) já está configurado.

**Convenção de cliente:** Todas as queries em Server Components usam `createClient()` de `lib/supabase/server.ts` (já existente). Nunca importar o client de `lib/supabase/client.ts` em Server Components.

---

## FASE 1 — Schema

Aplicar via Supabase MCP (`apply_migration`) na ordem abaixo, respeitando dependências de foreign key.

### 1.1 — Tabela `profiles`

```sql
-- Migration: 001_create_profiles
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 1.2 — Tabela `channels`

```sql
-- Migration: 002_create_channels
CREATE TABLE channels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  avatar_url   TEXT,
  banner_url   TEXT,
  description  TEXT,
  video_count  INTEGER DEFAULT 0,
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channels_select_public"
  ON channels FOR SELECT USING (true);

CREATE POLICY "channels_insert_own"
  ON channels FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "channels_update_own"
  ON channels FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "channels_delete_own"
  ON channels FOR DELETE USING (auth.uid() = owner_id);
```

> **Nota:** `video_count` é desnormalizado — atualizado via trigger na Fase 1.8.

### 1.3 — Tabela `videos`

```sql
-- Migration: 003_create_videos
CREATE TABLE videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id       UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  thumbnail_url    TEXT,
  video_url        TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_exclusive     BOOLEAN DEFAULT FALSE,
  view_count       INTEGER DEFAULT 0,
  published_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX videos_channel_id_idx ON videos(channel_id);
CREATE INDEX videos_published_at_idx ON videos(published_at DESC);
CREATE INDEX videos_view_count_idx ON videos(view_count DESC);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_select_public"
  ON videos FOR SELECT USING (true);

CREATE POLICY "videos_insert_own"
  ON videos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND owner_id = auth.uid())
  );

CREATE POLICY "videos_update_own"
  ON videos FOR UPDATE USING (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND owner_id = auth.uid())
  );

CREATE POLICY "videos_delete_own"
  ON videos FOR DELETE USING (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND owner_id = auth.uid())
  );
```

### 1.4 — Tabela `follows`

```sql
-- Migration: 004_create_follows
CREATE TABLE follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id  UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

CREATE INDEX follows_user_id_idx ON follows(user_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select_public"
  ON follows FOR SELECT USING (true);

CREATE POLICY "follows_insert_own"
  ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "follows_delete_own"
  ON follows FOR DELETE USING (auth.uid() = user_id);
```

### 1.5 — Tabela `subscriptions`

```sql
-- Migration: 005_create_subscriptions
CREATE TABLE subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id  UUID REFERENCES channels(id) ON DELETE CASCADE,
  plan_type   TEXT NOT NULL CHECK (plan_type IN ('individual', 'global')),
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- INSERT via server-side apenas (sem policy de INSERT para anon/user direto)
```

### 1.6 — Tabelas `video_views`, `video_likes`, `watch_later`

```sql
-- Migration: 006_create_user_video_tables

-- video_views
CREATE TABLE video_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
CREATE INDEX video_views_user_watched_idx ON video_views(user_id, watched_at DESC);

-- video_likes
CREATE TABLE video_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
CREATE INDEX video_likes_user_id_idx ON video_likes(user_id);

-- watch_later
CREATE TABLE watch_later (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
CREATE INDEX watch_later_user_id_idx ON watch_later(user_id);

-- RLS para as três tabelas (padrão: só o próprio usuário)
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_later ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_views_own" ON video_views USING (auth.uid() = user_id);
CREATE POLICY "video_likes_own" ON video_likes USING (auth.uid() = user_id);
CREATE POLICY "watch_later_own" ON watch_later USING (auth.uid() = user_id);
```

### 1.7 — Tabelas `referrals` e `affiliate_applications`

```sql
-- Migration: 007_create_referrals_affiliates

-- referrals
CREATE TABLE referrals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'active', 'expired')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);
CREATE INDEX referrals_referrer_id_idx ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_own"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- affiliate_applications
CREATE TABLE affiliate_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  social_links TEXT[],
  message      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_applications_select_own"
  ON affiliate_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "affiliate_applications_insert_own"
  ON affiliate_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 1.8 — Triggers

```sql
-- Migration: 008_create_triggers

-- Trigger 1: incrementar view_count em videos quando um video_view é inserido
CREATE OR REPLACE FUNCTION increment_video_view_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE videos SET view_count = view_count + 1 WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_video_view_insert
  AFTER INSERT ON video_views
  FOR EACH ROW EXECUTE FUNCTION increment_video_view_count();

-- Trigger 2: manter video_count em channels
CREATE OR REPLACE FUNCTION update_channel_video_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels SET video_count = video_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE channels SET video_count = video_count - 1 WHERE id = OLD.channel_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_video_insert
  AFTER INSERT ON videos
  FOR EACH ROW EXECUTE FUNCTION update_channel_video_count();

CREATE TRIGGER on_video_delete
  AFTER DELETE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_channel_video_count();

-- Trigger 3: criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## FASE 2 — Types

### 2.1 — Gerar tipos do banco

Rodar após aplicar todas as migrations:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts
```

O `<PROJECT_ID>` está disponível via Supabase MCP (`get_project`).

### 2.2 — Atualizar `lib/types.ts`

Substituir o conteúdo completo do arquivo:

```typescript
// lib/types.ts

export type Channel = {
  id: string
  name: string
  username: string           // inclui @: "@tteuw"
  avatar: string             // mapeia avatar_url
  description: string
  videoCount: number         // mapeia video_count
  isSubscribed?: boolean     // opcional — só disponível em contexto autenticado
  isFollowing?: boolean      // opcional — só disponível em contexto autenticado
}

export type Video = {
  id: string
  title: string
  thumbnail: string          // mapeia thumbnail_url
  duration: string           // formatado via formatDuration(duration_seconds)
  duration_seconds: number   // campo bruto do banco
  channelName: string        // mapeia channel.name
  channelAvatar: string      // mapeia channel.avatar_url
  channelSlug: string        // mapeia channel.slug
  isExclusive: boolean       // mapeia is_exclusive
  views: number              // mapeia view_count
  createdAt: string          // mapeia published_at
  channel?: Channel          // objeto completo do canal (disponível em queries com JOIN)
}

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}

// Helper: converte duration_seconds em "H:MM:SS" ou "M:SS"
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}
```

**Mapeamento banco → tipo `Video`:**

| Banco | Tipo `Video` |
|-------|-------------|
| `videos.id` | `id` |
| `videos.title` | `title` |
| `videos.thumbnail_url` | `thumbnail` |
| `videos.duration_seconds` | `duration_seconds` + `duration` (via `formatDuration`) |
| `channels.name` | `channelName` |
| `channels.avatar_url` | `channelAvatar` |
| `channels.slug` | `channelSlug` |
| `videos.is_exclusive` | `isExclusive` |
| `videos.view_count` | `views` |
| `videos.published_at` | `createdAt` |

**Mapeamento banco → tipo `Channel`:**

| Banco | Tipo `Channel` |
|-------|---------------|
| `channels.id` | `id` |
| `channels.name` | `name` |
| `channels.username` | `username` (prefixar com `@` se não tiver) |
| `channels.avatar_url` | `avatar` |
| `channels.description` | `description` |
| `channels.video_count` | `videoCount` |

---

## FASE 3 — Queries

Criar o diretório `lib/supabase/queries/` com 4 arquivos.

### 3.1 — `lib/supabase/queries/videos.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { Video, formatDuration } from '@/lib/types'

// Mapeador: linha do banco → Video
function mapVideo(row: any): Video {
  return {
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail_url ?? '',
    duration_seconds: row.duration_seconds,
    duration: formatDuration(row.duration_seconds),
    channelName: row.channels?.name ?? row.channel_name ?? '',
    channelAvatar: row.channels?.avatar_url ?? row.channel_avatar ?? '',
    channelSlug: row.channels?.slug ?? row.channel_slug ?? '',
    isExclusive: row.is_exclusive,
    views: row.view_count,
    createdAt: row.published_at,
  }
}

// Últimos 12 vídeos — Home feed
export async function getHomeVideos(): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, slug)')
      .order('published_at', { ascending: false })
      .limit(12)

    if (error) throw error
    return (data ?? []).map(mapVideo)
  } catch {
    return []
  }
}

// Top 20 por view_count — Trending
export async function getTrendingVideos(): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, slug)')
      .order('view_count', { ascending: false })
      .limit(20)

    if (error) throw error
    return (data ?? []).map(mapVideo)
  } catch {
    return []
  }
}

// Vídeo por ID — Watch page
export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, slug)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? mapVideo(data) : null
  } catch {
    return null
  }
}

// Vídeos de um canal — Channel page
export async function getChannelVideos(channelId: string): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, slug)')
      .eq('channel_id', channelId)
      .order('published_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map(mapVideo)
  } catch {
    return []
  }
}

// 4 vídeos relacionados (mesmo canal, excluindo o atual) — Watch page sidebar
export async function getRelatedVideos(channelId: string, excludeId: string): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, slug)')
      .eq('channel_id', channelId)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(4)

    if (error) throw error
    return (data ?? []).map(mapVideo)
  } catch {
    return []
  }
}
```

### 3.2 — `lib/supabase/queries/channels.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { Channel } from '@/lib/types'

// Mapeador: linha do banco → Channel
function mapChannel(row: any): Channel {
  return {
    id: row.id,
    name: row.name,
    username: row.username.startsWith('@') ? row.username : `@${row.username}`,
    avatar: row.avatar_url ?? '',
    description: row.description ?? '',
    videoCount: row.video_count ?? 0,
  }
}

// Todos os canais — Channels page
export async function getAllChannels(): Promise<Channel[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name')

    if (error) throw error
    return (data ?? []).map(mapChannel)
  } catch {
    return []
  }
}

// Canal por slug — Channel[slug] page
export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data ? mapChannel(data) : null
  } catch {
    return null
  }
}

// Canais em destaque — Home feed
export async function getFeaturedChannels(limit = 8): Promise<Channel[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data ?? []).map(mapChannel)
  } catch {
    return []
  }
}
```

### 3.3 — `lib/supabase/queries/user-data.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { Video, Channel, formatDuration } from '@/lib/types'

function mapVideoFromJoin(row: any): Video {
  const v = row.videos
  const c = v?.channels
  return {
    id: v.id,
    title: v.title,
    thumbnail: v.thumbnail_url ?? '',
    duration_seconds: v.duration_seconds,
    duration: formatDuration(v.duration_seconds),
    channelName: c?.name ?? '',
    channelAvatar: c?.avatar_url ?? '',
    channelSlug: c?.slug ?? '',
    isExclusive: v.is_exclusive,
    views: v.view_count,
    createdAt: v.published_at,
  }
}

function mapChannelFromJoin(row: any): Channel {
  const c = row.channels
  return {
    id: c.id,
    name: c.name,
    username: c.username.startsWith('@') ? c.username : `@${c.username}`,
    avatar: c.avatar_url ?? '',
    description: c.description ?? '',
    videoCount: c.video_count ?? 0,
    isSubscribed: true,
  }
}

// Assinaturas do usuário — com dados do canal
export async function getSubscriptions(userId: string): Promise<Channel[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, channels(*)')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())

    if (error) throw error
    return (data ?? [])
      .filter((row) => row.channels)
      .map(mapChannelFromJoin)
  } catch {
    return []
  }
}

// Canais seguidos pelo usuário
export async function getFollowing(userId: string): Promise<Channel[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('follows')
      .select('*, channels(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? [])
      .filter((row) => row.channels)
      .map((row) => ({
        ...mapChannelFromJoin(row),
        isSubscribed: undefined,
        isFollowing: true,
      }))
  } catch {
    return []
  }
}

// Histórico de visualizações
export async function getWatchHistory(userId: string): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_views')
      .select('*, videos(*, channels(name, avatar_url, slug))')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return (data ?? [])
      .filter((row) => row.videos)
      .map(mapVideoFromJoin)
  } catch {
    return []
  }
}

// Fila "assistir mais tarde"
export async function getWatchLater(userId: string): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('watch_later')
      .select('*, videos(*, channels(name, avatar_url, slug))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? [])
      .filter((row) => row.videos)
      .map(mapVideoFromJoin)
  } catch {
    return []
  }
}

// Vídeos curtidos
export async function getLikedVideos(userId: string): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_likes')
      .select('*, videos(*, channels(name, avatar_url, slug))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? [])
      .filter((row) => row.videos)
      .map(mapVideoFromJoin)
  } catch {
    return []
  }
}

// Indicações do usuário
export async function getReferrals(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  } catch {
    return []
  }
}
```

### 3.4 — `lib/supabase/queries/affiliates.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Buscar candidatura existente do usuário
export async function getAffiliateApplication(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('affiliate_applications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch {
    return null
  }
}

// Server Action — submeter candidatura
export async function submitAffiliateApplication(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const channelName = formData.get('channel_name') as string
  const socialLinks = formData.getAll('social_links') as string[]
  const message = formData.get('message') as string

  const { error } = await supabase
    .from('affiliate_applications')
    .insert({
      user_id: user.id,
      channel_name: channelName,
      social_links: socialLinks.filter(Boolean),
      message,
    })

  if (error) {
    // Candidatura já existe (UNIQUE constraint)
    if (error.code === '23505') redirect('/affiliates?error=already_applied')
    throw error
  }

  redirect('/affiliates?success=true')
}
```

---

## FASE 4 — Conectar Páginas

### Regra geral de mapeamento de dados

Antes de passar dados do banco para os componentes, sempre executar o mapeador (banco → tipo `Video`/`Channel`). Os componentes `VideoCard`, `ChannelCard`, `VideoGrid`, `ChannelRow` não devem ser modificados — apenas os dados passados a eles.

### 4.1 — `app/(public)/trending/page.tsx`

**Query:** `getTrendingVideos()`

```typescript
import { getTrendingVideos } from '@/lib/supabase/queries/videos'

export default async function TrendingPage() {
  const videos = await getTrendingVideos()
  // ...passar videos para <VideoGrid videos={videos} size="medium" />
}
```

**Notas:**
- Remover import de `mockVideos`
- Manter `AppShell`, `PageHeader`, `VideoGrid` intactos
- Se `videos.length === 0`, a `VideoGrid` renderiza lista vazia — sem modificação necessária

### 4.2 — `app/(public)/channels/page.tsx`

**Query:** `getAllChannels()`

```typescript
import { getAllChannels } from '@/lib/supabase/queries/channels'

export default async function ChannelsPage() {
  const channels = await getAllChannels()
  // ...passar channels para <ChannelRow channels={channels} ... />
}
```

### 4.3 — `app/channel/[slug]/page.tsx`

**Queries:** `getChannelBySlug(slug)` + `getChannelVideos(channel.id)`

```typescript
import { getChannelBySlug } from '@/lib/supabase/queries/channels'
import { getChannelVideos } from '@/lib/supabase/queries/videos'
import { notFound } from 'next/navigation'

export default async function ChannelPage({ params }: { params: { slug: string } }) {
  const channel = await getChannelBySlug(params.slug)
  if (!channel) notFound()

  const videos = await getChannelVideos(channel.id)
  // ...renderizar
}
```

### 4.4 — `app/watch/[id]/page.tsx`

**Queries:** `getVideoById(id)` + `getRelatedVideos(channelId, id)`

```typescript
import { getVideoById, getRelatedVideos } from '@/lib/supabase/queries/videos'
import { notFound } from 'next/navigation'

export default async function WatchPage({ params }: { params: { id: string } }) {
  const video = await getVideoById(params.id)
  if (!video) notFound()

  const related = await getRelatedVideos(video.channelSlug, video.id)
  // Nota: getRelatedVideos precisa do channelId (UUID), não do slug.
  // Ajuste: armazenar channel.id no tipo Video ou buscar o canal separado.
  // Solução simples: usar video.channel?.id se disponível, ou adicionar channel_id ao tipo Video.
}
```

> **Atenção:** `getRelatedVideos` recebe `channelId` (UUID). O tipo `Video` não expõe `channel_id` diretamente. **Solução:** adicionar `channelId: string` ao tipo `Video` no mapeador `mapVideo`, mapeando `row.channel_id`.

**Ajuste ao tipo `Video` em `lib/types.ts`:**
```typescript
export type Video = {
  // ... campos existentes
  channelId: string          // adicionar — mapeia channel_id do banco
}
```

**Ajuste ao `mapVideo` em `videos.ts`:**
```typescript
channelId: row.channel_id,
```

### 4.5 — `app/(auth)/home/page.tsx`

**Queries:** `getHomeVideos()` + `getFeaturedChannels()`

```typescript
import { getHomeVideos } from '@/lib/supabase/queries/videos'
import { getFeaturedChannels } from '@/lib/supabase/queries/channels'

export default async function AuthHomePage() {
  const [videos, channels] = await Promise.all([
    getHomeVideos(),
    getFeaturedChannels(8),
  ])

  const largeVideos = videos.slice(0, 3)
  const mediumVideos = videos.slice(3)
  // ...
}
```

### 4.6 — Páginas auth com `userId`

Padrão para obter `userId` em Server Components autenticados:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Dentro do componente:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
const userId = user.id
```

| Página | Query |
|--------|-------|
| `app/(auth)/subscriptions/page.tsx` | `getSubscriptions(userId)` → `<ChannelRow channels={...} />` |
| `app/(auth)/following/page.tsx` | `getFollowing(userId)` → `<ChannelRow channels={...} />` |
| `app/(auth)/history/page.tsx` | `getWatchHistory(userId)` → `<VideoGrid videos={...} size="medium" />` |
| `app/(auth)/watch-later/page.tsx` | `getWatchLater(userId)` → `<VideoGrid videos={...} size="medium" />` |
| `app/(auth)/liked/page.tsx` | `getLikedVideos(userId)` → `<VideoGrid videos={...} size="medium" />` |
| `app/(auth)/referrals/page.tsx` | `getReferrals(userId)` → renderizar lista de referrals |
| `app/(auth)/affiliates/page.tsx` | `getAffiliateApplication(userId)` → condicional: mostrar status ou botão de aplicar |
| `app/(auth)/affiliates/apply/page.tsx` | `<form action={submitAffiliateApplication}>` |

**Para subscriptions/following:** Se array vazio, manter o `<EmptyState>` existente. Mostrar `<ChannelRow>` apenas se `channels.length > 0`.

**Para affiliates/page.tsx:** Condicional com base no `application`:
- `application === null` → mostrar `<EmptyState>` + botão "Aplicar"
- `application.status === 'pending'` → mostrar "Candidatura em análise"
- `application.status === 'approved'` → mostrar dashboard de afiliado
- `application.status === 'rejected'` → mostrar mensagem de rejeição

**Para affiliates/apply/page.tsx:** Converter o `<button type="submit">` existente para `<form action={submitAffiliateApplication}>`. Adicionar `name` attributes nos campos:
- Nome do canal: `name="channel_name"`
- Link do canal: `name="social_links"`
- Mensagem: `name="message"`

### 4.7 — `components/layout/Sidebar.tsx`

**Query:** seguidos do usuário para a seção "Seguindo" da sidebar.

```typescript
// Dentro do Sidebar (Server Component), quando isLoggedIn:
import { getFollowing } from '@/lib/supabase/queries/user-data'

// Obter user da sessão e buscar follows:
const followedChannels = userId ? await getFollowing(userId) : []
// Passar para a seção "Seguindo" da sidebar
```

**Atenção:** Verificar se `Sidebar.tsx` já recebe `userId` como prop ou busca a sessão internamente. Se for Client Component, extrair a busca para o `AppShell` e passar como prop.

---

## FASE 5 — Seed Data

### 5.1 — `scripts/seed.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role para bypass RLS
)

const channels = [
  { slug: 'tteuw', name: 'tteuw', username: '@tteuw', description: 'Streamer competitivo', avatar_url: 'https://picsum.photos/seed/ch1/64/64' },
  { slug: 'brkk', name: 'brkk', username: '@brkk', description: 'FPS e estratégia', avatar_url: 'https://picsum.photos/seed/ch2/64/64' },
  { slug: 'coringa', name: 'coringa', username: '@coringa', description: 'Entretenimento geral', avatar_url: 'https://picsum.photos/seed/ch3/64/64' },
  { slug: 'xablau', name: 'xablau', username: '@xablau', description: 'RPG e aventura', avatar_url: 'https://picsum.photos/seed/ch4/64/64' },
  { slug: 'kauan_plays', name: 'kauan_plays', username: '@kauan_plays', description: 'Esports', avatar_url: 'https://picsum.photos/seed/ch5/64/64' },
]

const videoTitles = [
  'Stream de 8 horas seguidas', 'Ranked até o limite', 'Jogando com inscritos ao vivo',
  'Gameplay noturno', 'Torneio especial', 'Late night chill', 'Especial fim de semana',
  'Maratona de jogos', 'Treino intensivo', 'Clutch moments', 'Best of da semana',
  'Road to challenger', 'Fim de temporada', 'Noite de terror', 'Co-op com amigos',
  'Try hard Friday', 'Casual Sunday', 'AMA ao vivo', 'Highlights do mês', 'Season finale',
]

async function seed() {
  console.log('Inserindo canais...')
  const { data: insertedChannels, error: chErr } = await supabase
    .from('channels')
    .insert(channels)
    .select()

  if (chErr) { console.error(chErr); return }

  console.log('Inserindo vídeos...')
  const videos = videoTitles.map((title, i) => ({
    channel_id: insertedChannels![i % insertedChannels!.length].id,
    title,
    thumbnail_url: `https://picsum.photos/seed/v${i + 1}/507/285`,
    duration_seconds: Math.floor(Math.random() * 28800) + 600, // 10min a 8h
    is_exclusive: i % 3 === 0,
    view_count: Math.floor(Math.random() * 15000) + 500,
    published_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }))

  const { error: vErr } = await supabase.from('videos').insert(videos)
  if (vErr) { console.error(vErr); return }

  console.log('Seed concluído!')
}

seed()
```

**Para rodar:**
```bash
# Adicionar SUPABASE_SERVICE_ROLE_KEY no .env.local
npx ts-node --project tsconfig.json scripts/seed.ts
```

---

## Ordem de Execução Resumida

```
[ ] 1. Fase 1: Aplicar migrations 001 a 008 via Supabase MCP
[ ] 2. Fase 2a: Gerar types/database.ts com supabase gen types
[ ] 3. Fase 2b: Atualizar lib/types.ts (Video + Channel + formatDuration)
[ ] 4. Fase 3: Criar lib/supabase/queries/ (videos, channels, user-data, affiliates)
[ ] 5. Fase 5: Rodar seed para popular o banco
[ ] 6. Fase 4a: Conectar páginas públicas (trending, channels, channel[slug], watch[id])
[ ] 7. Fase 4b: Conectar páginas auth (home, subscriptions, following, history, watch-later, liked)
[ ] 8. Fase 4c: Conectar páginas de usuário avançado (referrals, affiliates, affiliates/apply)
[ ] 9. Fase 4d: Atualizar Sidebar para buscar follows reais
```

---

## Decisões de Arquitetura

| Decisão | Razão |
|---------|-------|
| `createClient()` de `lib/supabase/server.ts` em todas as queries | Já existe, usa `@supabase/ssr` corretamente com cookies |
| `try/catch` retornando `[]` ou `null` | UI nunca quebra por erro de banco — mostra empty state |
| Mapeador `mapVideo/mapChannel` inline em cada query file | Evita abstração prematura; fácil de ajustar por query |
| `Promise.all` na home auth | Busca paralela de vídeos + canais — reduz latência |
| `video_count` desnormalizado em `channels` | Evita `COUNT(*)` em toda listagem de canais — atualizado por trigger |
| `notFound()` para canal/vídeo não encontrado | Retorna 404 correto ao invés de quebrar a UI |
| Seed com `service_role_key` | Bypass de RLS necessário para inserção administrativa |
