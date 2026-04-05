'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordView(videoId: string, userId?: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('video_views')
    .insert({ video_id: videoId, user_id: userId ?? null })

  await supabase.rpc('increment_view_count', { vid: videoId })
}

export async function toggleLike(videoId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { data: existing } = await supabase
    .from('video_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .maybeSingle()

  if (existing) {
    await supabase.from('video_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('video_likes').insert({ user_id: user.id, video_id: videoId })
  }

  revalidatePath(`/watch/${videoId}`)
  revalidatePath('/liked')
}

export async function toggleWatchLater(videoId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { data: existing } = await supabase
    .from('watch_later')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .maybeSingle()

  if (existing) {
    await supabase.from('watch_later').delete()
      .eq('user_id', user.id)
      .eq('video_id', videoId)
  } else {
    await supabase.from('watch_later').insert({ user_id: user.id, video_id: videoId })
  }

  revalidatePath('/watch-later')
}
