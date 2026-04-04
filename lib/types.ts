export type VideoSource = 'upload' | 'live_recording'

export type LiveSessionStatus = 'recording' | 'processing' | 'completed' | 'failed'

export type Video = {
  id: string
  title: string
  thumbnail: string          // mapeia thumbnail_url
  duration: string           // formatado via formatDuration(duration_seconds)
  duration_seconds: number   // campo bruto do banco
  channelId: string          // mapeia channel_id
  channelName: string        // mapeia channel.name
  channelAvatar: string      // mapeia channel.avatar_url
  channelSlug: string        // mapeia channel.slug
  isExclusive: boolean       // mapeia is_exclusive
  views: number              // mapeia view_count
  createdAt: string          // mapeia published_at
  source: VideoSource
  liveSessionId: string | null
  hlsUrl: string | null
  mp4Url: string | null
  channel?: Channel          // objeto completo do canal (disponível em queries com JOIN)
}

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

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}

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

// Helper: converte duration_seconds em "H:MM:SS" ou "M:SS"
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}
