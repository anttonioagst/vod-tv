import { createClient } from '@/lib/supabase/server'
import { LiveSession, Video, VideoSource, formatDuration } from '@/lib/types'

export type LiveWithChannel = {
  sessionId: string
  streamTitle: string | null
  startedAt: string | null
  channelId: string
  channelName: string
  channelSlug: string
  channelAvatar: string
}

/** Lives ativas com dados do canal — para a página /lives */
export async function getLivesWithChannels(): Promise<LiveWithChannel[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('live_sessions')
      .select(`
        id,
        stream_title,
        started_at,
        channels(id, name, slug, avatar_url)
      `)
      .eq('status', 'recording')
      .order('started_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ch = (row as any).channels ?? {}
      return {
        sessionId: row.id,
        streamTitle: row.stream_title ?? null,
        startedAt: row.started_at ?? null,
        channelId: ch.id ?? '',
        channelName: ch.name ?? '',
        channelSlug: ch.slug ?? '',
        channelAvatar: ch.avatar_url ?? '',
      }
    })
  } catch {
    return []
  }
}

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

/** Todas as lives com status 'recording' (para a página /lives) */
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

/** Live session ativa de um canal específico (null se offline) */
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
 * Busca vídeo + live_session associada em duas queries separadas.
 * Separado para que a página /watch/[id] funcione mesmo se as migrations
 * 012/013 (live_sessions + colunas live nos vídeos) ainda não foram aplicadas.
 */
export async function getVideoWithLiveData(
  videoId: string
): Promise<(Video & { liveSession: LiveSession | null }) | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, slug)')
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
      description: data.description ?? null,
    }

    // Busca live_session separadamente — falha silenciosa se tabela não existir
    let liveSession: LiveSession | null = null
    if (video.liveSessionId) {
      try {
        const { data: lsData } = await supabase
          .from('live_sessions')
          .select('*')
          .eq('id', video.liveSessionId)
          .maybeSingle()
        liveSession = lsData ? mapLiveSession(lsData) : null
      } catch {
        // migration 012 pode não ter sido aplicada ainda
      }
    }

    return { ...video, liveSession }
  } catch {
    return null
  }
}
