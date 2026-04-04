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
 * Busca vídeo + live_session associada em uma única query.
 * Usado na página /watch/[id] para decidir entre VideoPlayer e PaywallCard.
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
