'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(channelId: string, channelSlug: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('user_id', user.id)
    .eq('channel_id', channelId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
  } else {
    await supabase.from('follows').insert({ user_id: user.id, channel_id: channelId })
  }

  revalidatePath(`/channel/${channelSlug}`)
  revalidatePath('/')
}
