# PRD — Sistema de Lives + Video Player

> Vod.TV | Ciclo SDD: Live Recording + HLS Player
> Data: 03/04/2026
> Plataforma inicial: Twitch only

---

## Visão geral

Dois sistemas interligados:

1. **Worker de Lives** — processo Node.js externo que monitora canais da Twitch via EventSub, detecta início de live, inicia gravação com `streamlink` + `ffmpeg`, faz upload para Cloudflare R2 e registra tudo no Supabase

2. **Video Player** — componente React com `hls.js` que substitui o `PaywallCard.tsx` atual e serve tanto VODs gravados quanto lives ao vivo (embed Twitch iframe como fallback de live)

Esses dois sistemas se conectam via Supabase: o worker escreve, o Next.js lê.

---

## SISTEMA 1 — Worker de Lives (serviço externo)

### Stack do worker

- **Runtime:** Node.js 20 + TypeScript
- **Detecção:** Twitch EventSub (webhooks) — `stream.online` + `stream.offline`
- **Gravação:** `streamlink` CLI + `ffmpeg` (processo filho)
- **Storage:** Cloudflare R2 via `@aws-sdk/client-s3` (API compatível com S3)
- **Deploy:** Railway ou Render (processo sempre ativo, não serverless)
- **Comunicação com Supabase:** `@supabase/supabase-js` service role key

### Fluxo completo

```
Admin cadastra canal Twitch no Supabase (tabela `creator_channels`)
  ↓
Worker inicia → lê todos os canais ativos → registra webhooks EventSub na Twitch
  ↓
Twitch dispara POST /webhooks/twitch → stream.online
  ↓
Worker cria registro em `live_sessions` (status: 'recording')
  ↓
streamlink + ffmpeg inicia gravação → arquivo .ts sendo escrito em /tmp
  ↓
ffmpeg converte para HLS em tempo real (.m3u8 + segmentos .ts)
  ↓
Segmentos são enviados para R2 em tempo real (upload incremental)
  ↓
Twitch dispara stream.offline
  ↓
Worker finaliza ffmpeg → faz upload do arquivo .mp4 completo para R2
  ↓
Worker chama POST /api/admin/process-vod → Next.js cria registro em `videos`
  ↓
live_sessions.status → 'completed', video_url populado
```

### Tabelas Supabase necessárias

**`creator_channels`** (nova)
```sql
id              uuid primary key
channel_id      uuid references channels(id)
platform        text default 'twitch'  -- 'twitch' | 'kick'
platform_user_id text not null         -- ID numérico do canal na Twitch
platform_username text not null        -- login name da Twitch
twitch_webhook_id text                 -- ID do EventSub subscription
auto_record     boolean default true
created_at      timestamptz default now()
```

**`live_sessions`** (nova)
```sql
id              uuid primary key
channel_id      uuid references channels(id)
platform        text default 'twitch'
stream_title    text
started_at      timestamptz
ended_at        timestamptz
status          text default 'recording'  -- 'recording' | 'processing' | 'completed' | 'failed'
recording_path  text   -- caminho no R2
hls_url         text   -- URL do .m3u8 no R2 (para live em tempo real)
video_id        uuid references videos(id) -- preenchido após processamento
created_at      timestamptz default now()
```

**`videos`** (alterações na tabela existente)
```sql
-- adicionar colunas:
source          text default 'upload'  -- 'upload' | 'live_recording'
live_session_id uuid references live_sessions(id)
hls_url         text   -- URL do .m3u8 no R2 (para VOD)
mp4_url         text   -- URL do .mp4 no R2
duration_seconds int   -- já existe, confirmar
```

### Endpoints Next.js necessários (admin only)

**`POST /api/admin/channels`** — cadastra canal Twitch
```typescript
body: { channelId: string, twitchUsername: string }
// busca platform_user_id na Twitch API
// salva em creator_channels
// registra webhook EventSub
```

**`POST /api/webhooks/twitch`** — recebe eventos da Twitch
```typescript
// valida assinatura HMAC (obrigatório)
// stream.online → cria live_session + inicia worker via signal
// stream.offline → finaliza gravação
```

**`POST /api/admin/process-vod`** — chamado pelo worker após gravação
```typescript
body: { liveSessionId: string, mp4Url: string, hlsUrl: string, duration: number }
// cria registro em videos
// atualiza live_session.video_id
// atualiza live_session.status = 'completed'
```

**`GET /api/admin/channels`** — lista canais cadastrados (painel admin)

### Variáveis de ambiente do worker

```env
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_WEBHOOK_SECRET=      # string aleatória para validar webhooks
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=              # URL pública do bucket (ex: pub-xxx.r2.dev)
NEXT_APP_URL=               # URL do Vod.TV para chamar /api/admin/process-vod
WORKER_PORT=3001
```

---

## SISTEMA 2 — Video Player (Next.js)

### Stack do player

- **Library:** `hls.js` v1.x (instalado via npm, não CDN)
- **Componente:** Client Component `VideoPlayer.tsx`
- **Fallback de live ao vivo:** embed iframe da Twitch (enquanto HLS próprio não está pronto)
- **Substitui:** `PaywallCard.tsx` (que atualmente não tem player)

### Comportamento por modo

| Modo | Fonte | Implementação |
|------|-------|---------------|
| VOD gravado (exclusivo, logado e assinante) | HLS no R2 | `hls.js` → `video.hls_url` |
| VOD gravado (gratuito) | HLS no R2 | `hls.js` → `video.hls_url` |
| Live ao vivo | Twitch embed | `<iframe src="https://player.twitch.tv/?channel=X">` |
| Paywall (não assinante) | — | `PaywallCard.tsx` existente (sem mudança) |

### Controles do player (customizados, no design do Vod.TV)

- Play / Pause (barra de espaço)
- Seek bar com preview de thumbnail (opcional v2)
- Volume + mute
- Tempo atual / duração total
- Fullscreen
- Seletor de qualidade (automático via hls.js `levels`)
- Indicador "AO VIVO" (badge vermelho, quando `video.source === 'live_recording'` e live ativa)

### Componentes a criar/modificar

**`components/video/VideoPlayer.tsx`** (novo — Client Component)
```typescript
interface VideoPlayerProps {
  hlsUrl: string
  mp4Url?: string       // fallback
  isLive?: boolean      // badge AO VIVO
  twitchChannel?: string // se isLive, usa embed Twitch
  poster?: string       // thumbnail
  title: string
  isExclusive: boolean
  isSubscribed: boolean
}
```

**`app/(public)/watch/[id]/page.tsx`** (modificar)
- Atualmente só renderiza `PaywallCard`
- Nova lógica:
  1. Busca vídeo + live_session + verifica assinatura do user
  2. Se `!isSubscribed && isExclusive` → `PaywallCard`
  3. Se `isSubscribed || !isExclusive` → `VideoPlayer`

**`components/video/LiveBadge.tsx`** (novo — Server Component)
- Badge "AO VIVO" em vermelho (#ef4444)
- Exibido em VideoCard quando `live_session.status === 'recording'`

**`app/(public)/lives/page.tsx`** (nova rota)
- Lista todos os canais com `live_session.status === 'recording'`
- Cards com badge "AO VIVO" e embed ao vivo

### Queries Supabase necessárias

**`queries/lives.ts`** (novo arquivo)
```typescript
getActiveLiveSessions()     // todas as lives em andamento
getLiveSessionByChannel(channelId)
getVideoWithLiveData(videoId) // join videos + live_sessions
```

**`queries/videos.ts`** (modificar)
```typescript
getVideoById(id)  // adicionar: hls_url, mp4_url, source, live_session_id
```

---

## SISTEMA 3 — Painel Admin (backend only, sem UI pública)

### Rota: `app/(admin)/admin/channels/page.tsx`

Route group `(admin)` separado com middleware de proteção por email do admin.

Funcionalidades:
- Listar canais cadastrados + status da última live
- Formulário: adicionar canal Twitch (input: username)
- Toggle: ativar/desativar gravação automática
- Ver histórico de lives gravadas por canal

---

## Ordem de implementação recomendada (Spec)

### Fase 1 — Banco e tipos (sem worker)
1. Migrations: `creator_channels`, `live_sessions`, alterações em `videos`
2. Tipos TypeScript atualizados em `lib/types.ts`
3. Queries em `queries/lives.ts` e atualização de `queries/videos.ts`

### Fase 2 — Player de VOD (sem live ainda)
4. `VideoPlayer.tsx` com hls.js (modo VOD)
5. Modificar `watch/[id]/page.tsx` para usar VideoPlayer quando tem `hls_url`
6. Testar com um vídeo HLS de teste público

### Fase 3 — API endpoints
7. `POST /api/admin/channels`
8. `POST /api/webhooks/twitch` (com validação HMAC)
9. `POST /api/admin/process-vod`

### Fase 4 — Worker externo (repositório separado)
10. Estrutura do projeto Node.js worker
11. EventSub subscription manager
12. streamlink + ffmpeg process manager
13. Upload para R2

### Fase 5 — Lives ao vivo + UI
14. `app/(public)/lives/page.tsx`
15. `LiveBadge.tsx` nos VideoCards
16. VideoPlayer modo live (embed Twitch iframe)
17. Sidebar: adicionar item "Lives"

---

## Referências técnicas

- Twitch EventSub: https://dev.twitch.tv/docs/eventsub/
- streamlink docs: https://streamlink.github.io/
- hls.js: https://github.com/video-dev/hls.js
- Cloudflare R2 S3 API: https://developers.cloudflare.com/r2/api/s3/
- streamrecorder.io (referência de produto): usa exatamente esse stack (streamlink + ffmpeg + cloud storage)

---

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Plataforma inicial | Twitch only | EventSub é estável e gratuito; Kick não tem API pública |
| Detecção | EventSub webhooks | Confiável, push-based, sem polling |
| Gravação | streamlink + ffmpeg | Padrão da indústria, usado pelo streamrecorder.io |
| Storage | Cloudflare R2 | Egress gratuito, API S3-compatible, já alinhado com stack Vercel |
| Player | hls.js customizado | Controle total do design, sem CSS de terceiros para sobrescrever |
| Live ao vivo (v1) | Embed Twitch iframe | Mais rápido para implementar; player HLS próprio para live fica na v2 |
| Deploy worker | Railway | $5/mês, deploy simples de processo Node.js, suporte a variáveis de ambiente |
