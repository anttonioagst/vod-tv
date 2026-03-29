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
    channelId: v.channel_id,
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
