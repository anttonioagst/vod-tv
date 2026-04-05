import { createClient } from '@/lib/supabase/server'
import { Video, VideoSource, Channel, formatDuration } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVideoFromJoin(row: any): Video {
  const v = row.videos
  const c = v?.channels
  return {
    id: v.id,
    title: v.title,
    thumbnail: v.thumbnail_url ?? '',
    duration_seconds: v.duration_seconds,
    duration: formatDuration(v.duration_seconds),
    channelId: v.channel_id,
    channelName: c?.name ?? '',
    channelAvatar: c?.avatar_url ?? '',
    channelSlug: c?.slug ?? '',
    isExclusive: v.is_exclusive,
    views: v.view_count,
    createdAt: v.published_at,
    source: (v.source ?? 'upload') as VideoSource,
    liveSessionId: v.live_session_id ?? null,
    hlsUrl: v.hls_url ?? null,
    mp4Url: v.mp4_url ?? null,
    description: v.description ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function getIsLiked(userId: string, videoId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('video_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .limit(1)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}

export async function getIsFollowing(userId: string, channelId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .limit(1)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}

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
