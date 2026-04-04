# Spec — Lives + Video Player: Fase 1 e Fase 2

> Estado atual verificado em 04/04/2026.
> Cobre apenas Fase 1 (banco + tipos + queries) e Fase 2 (VideoPlayer com hls.js).
> Não implementar Fase 3+ ainda.

---

## Estado atual do projeto

| Item | Estado |
|------|--------|
| Última migration | `010_increment_view_count_fn.sql` |
| `lib/types.ts` — Video | Sem `source`, `liveSessionId`, `hlsUrl`, `mp4Url` |
| `lib/types.ts` — LiveSession / CreatorChannel / VideoSource | **NÃO existe** |
| `lib/supabase/queries/videos.ts` — `mapVideo` | Sem os 4 novos campos |
| `lib/supabase/queries/lives.ts` | **NÃO existe** |
| `components/video/VideoPlayer.tsx` | **NÃO existe** |
| `app/(public)/watch/[id]/page.tsx` | Sempre exibe `PaywallCard` — sem player |

---

## Fase 1 — Banco, Tipos e Queries

### 1.1 Criar `supabase/migrations/011_create_creator_channels.sql`

```sql
CREATE TABLE creator_channels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id        UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL DEFAULT 'twitch',
  platform_user_id  TEXT NOT NULL,
  platform_username TEXT NOT NULL,
  twitch_webhook_id TEXT,
  auto_record       BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX creator_channels_channel_id_idx ON creator_channels(channel_id);
CREATE INDEX creator_channels_platform_user_id_idx ON creator_channels(platform_user_id);

ALTER TABLE creator_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_channels_service_only"
  ON creator_channels FOR ALL
  USING (auth.role() = 'service_role');
```

---

### 1.2 Criar `supabase/migrations/012_create_live_sessions.sql`

```sql
CREATE TABLE live_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id     UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  platform       TEXT NOT NULL DEFAULT 'twitch',
  stream_title   TEXT,
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'recording',
  -- status: 'recording' | 'processing' | 'completed' | 'failed'
  recording_path TEXT,
  hls_url        TEXT,
  video_id       UUID REFERENCES videos(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX live_sessions_channel_id_idx ON live_sessions(channel_id);
CREATE INDEX live_sessions_status_idx ON live_sessions(status);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Leitura pública (para exibir lives ativas no frontend)
CREATE POLICY "live_sessions_select_public"
  ON live_sessions FOR SELECT USING (true);

-- Escrita apenas service role (worker)
CREATE POLICY "live_sessions_write_service"
  ON live_sessions FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "live_sessions_update_service"
  ON live_sessions FOR UPDATE USING (auth.role() = 'service_role');
```

---

### 1.3 Criar `supabase/migrations/013_alter_videos_add_live_cols.sql`

```sql
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS source          TEXT NOT NULL DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS live_session_id UUID REFERENCES live_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hls_url         TEXT,
  ADD COLUMN IF NOT EXISTS mp4_url         TEXT;

CREATE INDEX videos_live_session_id_idx ON videos(live_session_id);
CREATE INDEX videos_source_idx ON videos(source);

ALTER TABLE videos
  ADD CONSTRAINT videos_source_check
  CHECK (source IN ('upload', 'live_recording'));
```

---

### 1.4 Modificar `lib/types.ts`

**O que muda:** adicionar 3 novos tipos + estender `Video` com 4 campos.

Após o tipo `User` existente, adicionar:

```typescript
export type VideoSource = 'upload' | 'live_recording'

export type LiveSessionStatus = 'recording' | 'processing' | 'completed' | 'failed'

export type LiveSession = {
  id: string
  channelId: string
  platform: string
  streamTitle: string | null
  startedAt: string | null
  endedAt: string | null
  status: LiveSessionStatus
  recordingPath: string | null
  hlsUrl: string | null
  videoId: string | null
  createdAt: string
}

export type CreatorChannel = {
  id: string
  channelId: string
  platform: string
  platformUserId: string
  platformUsername: string
  twitchWebhookId: string | null
  autoRecord: boolean
  createdAt: string
}
```

No tipo `Video` existente, adicionar os 4 campos **antes de `channel?`**:

```typescript
// Acrescentar antes de:  channel?: Channel
source: VideoSource
liveSessionId: string | null
hlsUrl: string | null
mp4Url: string | null
```

> `source` nunca é `null` — o banco tem `DEFAULT 'upload'`.
> Os outros 3 podem ser `null`.

---

### 1.5 Modificar `lib/supabase/queries/videos.ts`

**O que muda:** atualizar import + completar `mapVideo` com os 4 novos campos.

**Linha 2 — trocar import:**
```typescript
// De:
import { Video, formatDuration } from '@/lib/types'
// Para:
import { Video, VideoSource, formatDuration } from '@/lib/types'
```

**Dentro de `mapVideo` (após `createdAt: row.published_at,`):**
```typescript
source: (row.source ?? 'upload') as VideoSource,
liveSessionId: row.live_session_id ?? null,
hlsUrl: row.hls_url ?? null,
mp4Url: row.mp4_url ?? null,
```

> Nenhuma query precisa mudar — as 4 colunas novas chegam via `SELECT *` que já existe.

---

### 1.6 Criar `lib/supabase/queries/lives.ts`

Arquivo novo do zero. Exporta 3 funções:

```typescript
import { createClient } from '@/lib/supabase/server'
import { LiveSession, Video, VideoSource, formatDuration } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLiveSession(row: any): LiveSession {
  return {
    id: row.id,
    channelId: row.channel_id,
    platform: row.platform,
    streamTitle: row.stream_title ?? null,
    startedAt: row.started_at ?? null,
    endedAt: row.ended_at ?? null,
    status: row.status,
    recordingPath: row.recording_path ?? null,
    hlsUrl: row.hls_url ?? null,
    videoId: row.video_id ?? null,
    createdAt: row.created_at,
  }
}

/** Todas as lives ativas (status = 'recording') */
export async function getActiveLiveSessions(): Promise<LiveSession[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('status', 'recording')
      .order('started_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapLiveSession)
  } catch {
    return []
  }
}

/** Live ativa de um canal (null se offline) */
export async function getLiveSessionByChannel(channelId: string): Promise<LiveSession | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('channel_id', channelId)
      .eq('status', 'recording')
      .maybeSingle()
    if (error) throw error
    return data ? mapLiveSession(data) : null
  } catch {
    return null
  }
}

/**
 * Vídeo + live_session associada em uma query só.
 * Usado em /watch/[id] para decidir entre VideoPlayer e PaywallCard.
 */
export async function getVideoWithLiveData(
  videoId: string
): Promise<(Video & { liveSession: LiveSession | null }) | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        channels(name, avatar_url, slug),
        live_sessions(id, status, hls_url, stream_title, started_at)
      `)
      .eq('id', videoId)
      .single()

    if (error) throw error
    if (!data) return null

    const video: Video = {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail_url ?? '',
      duration_seconds: data.duration_seconds,
      duration: formatDuration(data.duration_seconds),
      channelId: data.channel_id,
      channelName: data.channels?.name ?? '',
      channelAvatar: data.channels?.avatar_url ?? '',
      channelSlug: data.channels?.slug ?? '',
      isExclusive: data.is_exclusive,
      views: data.view_count,
      createdAt: data.published_at,
      source: (data.source ?? 'upload') as VideoSource,
      liveSessionId: data.live_session_id ?? null,
      hlsUrl: data.hls_url ?? null,
      mp4Url: data.mp4_url ?? null,
    }

    // Supabase pode retornar array ou objeto dependendo da direção do FK
    const liveSessionRow = Array.isArray(data.live_sessions)
      ? (data.live_sessions[0] ?? null)
      : (data.live_sessions ?? null)

    return { ...video, liveSession: liveSessionRow ? mapLiveSession(liveSessionRow) : null }
  } catch {
    return null
  }
}
```

---

## Fase 2 — VideoPlayer com hls.js

### 2.0 Instalação

```bash
npm install hls.js
npm install --save-dev @types/hls.js
```

---

### 2.1 Criar `components/video/VideoPlayer.tsx`

Componente client. Suporta dois modos:
- **Live ao vivo** (`isLive=true` + `twitchChannel`): iframe Twitch embed
- **VOD / gravação** (`hlsUrl`): player customizado com hls.js

**Regras de design (tokens do projeto):**
| Elemento | Classe/valor |
|----------|-------------|
| Container | `bg-black rounded-lg overflow-hidden` |
| Overlay controles | `bg-gradient-to-t from-black/80 to-transparent` |
| Play/Pause | `<Play>` / `<Pause>` Lucide, 20×20 |
| Seek / Volume bar | `<input type="range">` com `accent-color: #fdff79` |
| Volume | `<Volume2>` / `<VolumeX>` Lucide, 16×16 |
| Fullscreen | `<Maximize>` / `<Minimize>` Lucide, 16×16 |
| Tempo | `text-[10px] font-mono text-white` |
| Badge AO VIVO | `bg-red-500 text-white text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-[3px]` |
| Seletor qualidade | `text-[10px] text-white bg-transparent border border-[#3e3e3e] rounded-[3px]` |

**Interface pública:**
```typescript
export interface VideoPlayerProps {
  hlsUrl: string
  mp4Url?: string
  isLive?: boolean
  twitchChannel?: string  // só para modo live real
  poster?: string
  title: string
}
```

**Lógica HLS (VOD):**
- Se `Hls.isSupported()`: usar hls.js, `startLevel: -1` (auto)
- Senão Safari: `video.src = hlsUrl` diretamente
- Fallback: `mp4Url` se disponível
- Cleanup: `hls.destroy()` no return do useEffect

**Controles a implementar:**
- Play/Pause (click no vídeo + botão)
- Mute/Unmute + slider de volume
- Seek bar (range 0..duration, step 0.5)
- Tempo atual / duração (`M:SS / M:SS`)
- Seletor de qualidade (aparece só se `levels.length > 0`)
- Fullscreen (`container.requestFullscreen()`)
- Auto-hide controles após 3s sem mousemove
- Tecla Space = play/pause (quando foco não está em input)

**Modo Twitch embed:**
```tsx
<iframe
  src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}`}
  className="w-full h-full"
  allowFullScreen
  title={title}
/>
```
> Wrap o `window.location.hostname` com `typeof window !== 'undefined' ? ... : 'localhost'`

---

### 2.2 Modificar `app/(public)/watch/[id]/page.tsx`

**Estado atual:** sempre exibe `PaywallCard`. Sem player.

**O que muda:**

1. **Trocar import de query:**
```typescript
// Remover:
import { getVideoById, getRelatedVideos } from '@/lib/supabase/queries/videos'
// Adicionar:
import { getRelatedVideos } from '@/lib/supabase/queries/videos'
import { getVideoWithLiveData } from '@/lib/supabase/queries/lives'
```

2. **Adicionar import do player:**
```typescript
import VideoPlayer from '@/components/video/VideoPlayer'
```

3. **Trocar busca do vídeo:**
```typescript
// Remover:
const video = await getVideoById(id)
if (!video) notFound()

// Por:
const videoData = await getVideoWithLiveData(id)
if (!videoData) notFound()
const { liveSession, ...video } = videoData
```

4. **Verificar assinatura** (após `supabase.auth.getUser()` que já existe):
```typescript
let isSubscribed = false
if (user) {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('channel_id', video.channelId)
    .maybeSingle()
  isSubscribed = !!sub
}
const showPlayer = !video.isExclusive || isSubscribed
```

5. **Substituir o bloco do player no JSX:**
```tsx
{/* Substituir o div h-[800px] atual por: */}
<div className="h-[800px] rounded-lg overflow-hidden bg-black flex flex-col">
  {showPlayer && video.hlsUrl ? (
    <VideoPlayer
      hlsUrl={video.hlsUrl}
      mp4Url={video.mp4Url ?? undefined}
      isLive={liveSession?.status === 'recording'}
      poster={video.thumbnail}
      title={video.title}
    />
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <PaywallCard channelName={video.channelSlug} />
    </div>
  )}
</div>
```

> Se `video.hlsUrl` for `null` (vídeo antigo sem HLS), exibe `PaywallCard` mesmo para assinantes.
> Isso é temporário — Fase 3 preenche `hls_url` via worker.

---

## Checklist de aceite

### Fase 1
- [ ] Migration `011`: tabela `creator_channels` no Supabase
- [ ] Migration `012`: tabela `live_sessions` no Supabase
- [ ] Migration `013`: colunas `source`, `live_session_id`, `hls_url`, `mp4_url` em `videos`
- [ ] `lib/types.ts`: `VideoSource`, `LiveSession`, `CreatorChannel` exportados; `Video` com 4 novos campos
- [ ] `queries/videos.ts`: `mapVideo` mapeia os 4 novos campos; `VideoSource` importado
- [ ] `queries/lives.ts`: 3 funções exportadas
- [ ] `tsc --noEmit` sem erros

### Fase 2
- [ ] `hls.js` + `@types/hls.js` instalados
- [ ] `VideoPlayer.tsx` compila sem erros de TS
- [ ] `/watch/[id]` com `hls_url` preenchido: player aparece
- [ ] `/watch/[id]` sem `hls_url`: `PaywallCard` aparece
- [ ] Vídeo exclusivo + user não assinante: `PaywallCard` aparece
- [ ] Play/Pause, seek, volume, fullscreen funcionam
- [ ] Barra de espaço pausa/retoma

## URL HLS de teste

Para validar o player sem vídeos reais:

```
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```

Inserir em um vídeo de teste no Supabase:

```sql
UPDATE videos
SET hls_url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    source = 'live_recording'
WHERE id = '<uuid-do-video-de-teste>';
```
