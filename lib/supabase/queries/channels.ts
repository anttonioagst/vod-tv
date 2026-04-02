import { createClient } from '@/lib/supabase/server'
import { Channel } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
