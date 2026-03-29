import { createClient } from '@/lib/supabase/server'
import { Video, formatDuration } from '@/lib/types'

function mapVideo(row: any): Video {
  return {
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail_url ?? '',
    duration_seconds: row.duration_seconds,
    duration: formatDuration(row.duration_seconds),
    channelId: row.channel_id,
    channelName: row.channels?.name ?? '',
    channelAvatar: row.channels?.avatar_url ?? '',
    channelSlug: row.channels?.slug ?? '',
    isExclusive: row.is_exclusive,
    views: row.view_count,
    createdAt: row.published_at,
  }
}

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
